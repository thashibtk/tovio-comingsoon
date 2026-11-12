"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DISTRICTS, safePath, townInDistrict, townsForDistrict } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import { categoryName, groupedCategories, skillLabel } from "@/lib/labels";
import { isMobileNumber, mobileDigits } from "@/lib/phone";
import { createClient } from "@/lib/supabase/client";
import type { AccountType, Availability, Category, WorkerProfile, WorkerSkill, WorkType } from "@/lib/types";

const SKILL_LEVELS = ["", "helper", "semi", "skilled", "supervisor"] as const;
const WORK_TYPES: WorkType[] = ["daily", "contract", "monthly", "any"];

export default function WorkerForm({
  userId,
  accountType,
  categories,
  worker,
  skills,
  nextPath,
  defaultEmail = "",
}: {
  userId: string;
  accountType: Extract<AccountType, "worker" | "agent">;
  categories: Category[];
  worker: WorkerProfile | null;
  skills: WorkerSkill[];
  nextPath?: string | null;
  defaultEmail?: string;
}) {
  const { t, lang } = useI18n();
  const router = useRouter();
  const isAgent = accountType === "agent";
  const activeCategories = categories.filter(
    (category) => category.active !== false || skills.some((skill) => skill.category_id === category.id)
  );
  const tradeGroups = useMemo(() => groupedCategories(activeCategories, lang), [activeCategories, lang]);
  const [name, setName] = useState(worker?.name ?? "");
  const email = defaultEmail || worker?.email || "";
  const [phone, setPhone] = useState(worker?.phone ?? "");
  const [district, setDistrict] = useState(worker?.district ?? "");
  const [town, setTown] = useState(
    worker?.district && worker.town && townInDistrict(worker.district, worker.town) ? worker.town : worker?.town ?? ""
  );
  const [skillLevel, setSkillLevel] = useState(worker?.skill_level ?? "");
  const [experience, setExperience] = useState(worker?.experience ?? "");
  const [workType, setWorkType] = useState<WorkType>(worker?.work_type ?? "any");
  const [preferred, setPreferred] = useState<string[]>(
    (worker?.preferred_districts ?? []).filter((id) => id !== (worker?.district ?? ""))
  );
  const [description, setDescription] = useState(worker?.description ?? "");
  const [photoUrl, setPhotoUrl] = useState(worker?.photo_url ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [selected, setSelected] = useState<Record<string, { total: number; available: number; level: string }>>(() => {
    const initial: Record<string, { total: number; available: number; level: string }> = {};
    skills.forEach((skill) => {
      initial[skill.category_id] = {
        total: skill.total_count,
        available: skill.available_count,
        level: skill.skill_level ?? "",
      };
    });
    return initial;
  });
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const selectedIds = useMemo(() => Object.keys(selected), [selected]);

  function toggleCategory(id: string) {
    setSelected((current) => {
      const next = { ...current };
      if (next[id]) delete next[id];
      else next[id] = { total: 1, available: 1, level: skillLevel };
      return next;
    });
  }

  function chooseDistrict(next: string) {
    setDistrict(next);
    setPreferred((current) => current.filter((id) => id !== next));
    setTown((current) => (next && townInDistrict(next, current) ? current : ""));
  }

  function togglePreferred(id: string) {
    if (id === district) return;
    setPreferred((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSaved(false);
    if (!name.trim() || !email.trim() || !district || !town.trim() || !workType) {
      setError(t.errors.required);
      return;
    }
    if (!isMobileNumber(phone)) {
      setError(t.errors.phone);
      return;
    }
    if (selectedIds.length === 0) {
      setError(t.errors.category);
      return;
    }
    if (isAgent && selectedIds.some((id) => selected[id].available > selected[id].total)) {
      setError(t.errors.counts);
      return;
    }
    if (file && (file.size > 2 * 1024 * 1024 || !file.type.startsWith("image/"))) {
      setError(t.fields.photoHint);
      return;
    }

    setLoading(true);
    const supabase = createClient();
    let nextPhoto = photoUrl;

    try {
      if (file) {
        const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
        const path = `${userId}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("profile-photos").upload(path, file, {
          contentType: file.type,
        });
        if (uploadError) throw uploadError;
        nextPhoto = supabase.storage.from("profile-photos").getPublicUrl(path).data.publicUrl;
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ account_type: accountType, language: lang })
        .eq("id", userId);
      if (profileError) throw profileError;

      const payload = {
        user_id: userId,
        profile_type: isAgent ? "agent" : "individual",
        name: name.trim(),
        email: email.trim(),
        phone: mobileDigits(phone),
        photo_url: nextPhoto || null,
        district,
        town: town.trim(),
        skill_level: isAgent ? null : skillLevel || null,
        experience: experience.trim() || null,
        availability: "available" as Availability,
        available_from: null,
        work_type: workType,
        preferred_districts: preferred.filter((id) => id !== district),
        description: description.trim() || null,
      };

      let profileId = worker?.id;
      let body: Record<string, unknown> = { ...payload };
      for (let attempt = 0; attempt < 3; attempt += 1) {
        if (profileId) {
          const { error: updateError } = await supabase.from("worker_profiles").update(body).eq("id", profileId);
          if (!updateError) break;
          if (attempt < 2 && dropMissingColumn(body, updateError.message)) continue;
          throw updateError;
        }
        const { data, error: insertError } = await supabase.from("worker_profiles").insert(body).select("id").single();
        if (!insertError && data?.id) {
          profileId = data.id;
          break;
        }
        if (insertError && attempt < 2 && dropMissingColumn(body, insertError.message)) continue;
        throw insertError ?? new Error("Profile was not created");
      }
      if (!profileId) throw new Error("Profile was not created");

      const { error: deleteError } = await supabase.from("worker_skills").delete().eq("profile_id", profileId);
      if (deleteError) throw deleteError;

      const rows = selectedIds.map((categoryId) => ({
        profile_id: profileId,
        category_id: categoryId,
        skill_level: (isAgent ? selected[categoryId].level : skillLevel) || null,
        total_count: isAgent ? Number(selected[categoryId].total) : 1,
        available_count: isAgent ? Number(selected[categoryId].available) : 1,
      }));
      const { error: skillError } = await supabase.from("worker_skills").insert(rows);
      if (skillError) throw skillError;

      setPhotoUrl(nextPhoto);
      setFile(null);
      setSaved(true);
      const destination = safePath(nextPath);
      if (destination) {
        window.location.assign(destination);
        return;
      }
      router.refresh();
    } catch (err) {
      console.error(err);
      const detail = err instanceof Error ? err.message : "";
      setError(detail ? `${t.errors.saveFailed} ${detail}` : t.errors.saveFailed);
    } finally {
      setLoading(false);
    }
  }

  if (activeCategories.length === 0) {
    return <p className="modal-error">{t.errors.noCategories}</p>;
  }

  return (
    <form className="setup" onSubmit={onSubmit}>
      <section className="setup-block">
        <SetupHeader step="1" title={t.fields.sectionYou} icon="you" />
        <div className="setup-grid">
          <label>
            <span>{isAgent ? t.fields.agentName : t.fields.name}</span>
            <input className="form-input" value={name} onChange={(event) => setName(event.target.value)} required />
          </label>
          <label>
            <span>{t.fields.phone}</span>
            <input
              className="form-input"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="9876543210"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              required
            />
            <small>{t.fields.phoneNote}</small>
          </label>
          <label className="span-2">
            <span>{t.fields.email}</span>
            <span className="locked-field">
              <input value={email} readOnly aria-readonly="true" tabIndex={-1} />
              <small>{t.fields.emailLocked}</small>
            </span>
          </label>
          <div className="photo-row span-2">
            {photoUrl ? <img className="photo-preview" src={photoUrl} alt="" /> : <span className="photo-fallback" aria-hidden="true">{name.trim().slice(0, 1).toUpperCase() || "T"}</span>}
            <label className="file-pick">
              <span>
                {t.fields.photo} <em>({t.fields.optional})</em>
              </span>
              <small>{file ? file.name : t.fields.photoHint}</small>
              <input type="file" accept="image/*" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
            </label>
          </div>
        </div>
      </section>

      <section className="setup-block">
        <SetupHeader step="2" title={t.fields.sectionPlace} icon="place" />
        <div className="setup-grid">
          <label>
            <span>{t.fields.district}</span>
            <select className="form-input" value={district} onChange={(event) => chooseDistrict(event.target.value)} required>
              <option value="">{t.common.select}</option>
              {DISTRICTS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item[lang]}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>{t.fields.town}</span>
            <select
              className="form-input"
              value={town}
              onChange={(event) => setTown(event.target.value)}
              required
              disabled={!district}
            >
              <option value="">{district ? t.fields.townPick : t.fields.townNeedDistrict}</option>
              {townsForDistrict(district).map((item) => (
                <option key={item.en} value={item.en}>
                  {item[lang]}
                </option>
              ))}
              {town && district && !townInDistrict(district, town) ? <option value={town}>{town}</option> : null}
            </select>
          </label>
        </div>
      </section>

      <section className="setup-block">
        <SetupHeader step="3" title={t.fields.sectionTrades} icon="trades" />
        <div className="trade-groups">
          {tradeGroups.map((group) => (
            <div key={group.label} className="trade-group">
              <h3>{group.label}</h3>
              <div className="trade-cloud">
                {group.items.map((category) => {
                  const checked = Boolean(selected[category.id]);
                  return (
                    <button
                      key={category.id}
                      className={checked ? "trade-chip on" : "trade-chip"}
                      type="button"
                      aria-pressed={checked}
                      onClick={() => toggleCategory(category.id)}
                    >
                      {categoryName(category, lang)}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        {isAgent && selectedIds.length > 0 ? (
          <div className="agent-counts">
            {selectedIds.map((categoryId) => {
              const category = activeCategories.find((item) => item.id === categoryId);
              if (!category) return null;
              return (
                <div key={categoryId} className="agent-count">
                  <strong>{categoryName(category, lang)}</strong>
                  <label>
                    <span>{t.fields.total}</span>
                    <input
                      className="form-input"
                      type="number"
                      min={0}
                      value={selected[categoryId].total}
                      onChange={(event) =>
                        setSelected((current) => ({
                          ...current,
                          [categoryId]: { ...current[categoryId], total: Number(event.target.value) },
                        }))
                      }
                    />
                  </label>
                  <label>
                    <span>{t.fields.availableCount}</span>
                    <input
                      className="form-input"
                      type="number"
                      min={0}
                      value={selected[categoryId].available}
                      onChange={(event) =>
                        setSelected((current) => ({
                          ...current,
                          [categoryId]: { ...current[categoryId], available: Number(event.target.value) },
                        }))
                      }
                    />
                  </label>
                  <label>
                    <span>{t.fields.skillLevel}</span>
                    <select
                      className="form-input"
                      value={selected[categoryId].level}
                      onChange={(event) =>
                        setSelected((current) => ({
                          ...current,
                          [categoryId]: { ...current[categoryId], level: event.target.value },
                        }))
                      }
                    >
                      {SKILL_LEVELS.map((level) => (
                        <option key={level || "none"} value={level}>
                          {skillLabel(t, level)}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              );
            })}
          </div>
        ) : null}
      </section>

      <section className="setup-block">
        <SetupHeader step="4" title={t.fields.sectionWhen} icon="work" />
        <div className="setup-grid">
          {isAgent ? null : (
            <label>
              <span>
                {t.fields.skillLevel} <em>({t.fields.optional})</em>
              </span>
              <select className="form-input" value={skillLevel} onChange={(event) => setSkillLevel(event.target.value)}>
                {SKILL_LEVELS.map((level) => (
                  <option key={level || "none"} value={level}>
                    {skillLabel(t, level)}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label>
            <span>{t.fields.workType}</span>
            <select className="form-input" value={workType} onChange={(event) => setWorkType(event.target.value as WorkType)}>
              {WORK_TYPES.map((type) => (
                <option key={type} value={type}>
                  {t.workType[type]}
                </option>
              ))}
            </select>
          </label>
          <label className={isAgent ? undefined : "span-2"}>
            <span>
              {t.fields.experience} <em>({t.fields.optional})</em>
            </span>
            <input
              className="form-input"
              placeholder={t.fields.experienceHint}
              value={experience ?? ""}
              onChange={(event) => setExperience(event.target.value)}
            />
          </label>
        </div>
      </section>

      <section className="setup-block">
        <SetupHeader step="5" title={t.fields.sectionMore} icon="more" />
        <div>
          <span className="setup-label">
            {t.fields.preferred} <em>({t.fields.optional})</em>
          </span>
          <div className="trade-cloud">
            {DISTRICTS.filter((item) => item.id !== district).map((item) => {
              const checked = preferred.includes(item.id);
              return (
                <button
                  key={item.id}
                  className={checked ? "trade-chip on" : "trade-chip"}
                  type="button"
                  aria-pressed={checked}
                  onClick={() => togglePreferred(item.id)}
                >
                  {item[lang]}
                </button>
              );
            })}
          </div>
          {district ? <small className="muted">{t.fields.preferredHome}</small> : null}
        </div>
        <label>
          <span>
            {t.fields.description} <em>({t.fields.optional})</em>
          </span>
          <textarea className="form-input" rows={4} value={description ?? ""} onChange={(event) => setDescription(event.target.value)} />
        </label>
      </section>

      <div className="setup-save">
        <div>
          {error ? <p className="modal-error">{error}</p> : null}
          {saved ? <p className="form-note">{t.fields.saved}</p> : null}
        </div>
        <button className="btn btn-dark" type="submit" disabled={loading}>
          {loading ? t.fields.saving : t.fields.save}
        </button>
      </div>
    </form>
  );
}

function SetupHeader({
  step,
  title,
  icon,
}: {
  step: string;
  title: string;
  icon: "you" | "place" | "trades" | "work" | "more";
}) {
  return (
    <header className="setup-heading">
      <span className="setup-icon" aria-hidden="true">
        <SetupIcon kind={icon} />
      </span>
      <div>
        <p className="setup-kicker">{step}</p>
        <h2>{title}</h2>
      </div>
    </header>
  );
}

function SetupIcon({ kind }: { kind: "you" | "place" | "trades" | "work" | "more" }) {
  if (kind === "you") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="3.2" />
        <path d="M5 19.5c1.2-3.2 3.6-4.8 7-4.8s5.8 1.6 7 4.8" />
      </svg>
    );
  }
  if (kind === "place") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21s6.5-5.2 6.5-11A6.5 6.5 0 0 0 5.5 10c0 5.8 6.5 11 6.5 11z" />
        <circle cx="12" cy="10" r="2.2" />
      </svg>
    );
  }
  if (kind === "trades") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 6.5l3 3L8 19H5v-3L14.5 6.5z" />
        <path d="M12.5 8.5l3 3" />
        <path d="M16 4l4 4" />
      </svg>
    );
  }
  if (kind === "work") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3.5" y="7" width="17" height="12.5" rx="2" />
        <path d="M9 7V5.8A1.8 1.8 0 0 1 10.8 4h2.4A1.8 1.8 0 0 1 15 5.8V7" />
        <path d="M3.5 12h17" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 4h7l4 4v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z" />
      <path d="M14 4v4h4" />
      <path d="M8.5 12h7M8.5 15.5h7" />
    </svg>
  );
}

function dropMissingColumn(body: Record<string, unknown>, message: string) {
  const named = message.match(/'([a-z_]+)' column|column "([a-z_]+)"/i);
  const column = named?.[1] || named?.[2];
  if (column && column in body) {
    delete body[column];
    return true;
  }
  if (/\bphone\b/i.test(message) && "phone" in body && !/show_phone/i.test(message)) {
    delete body.phone;
    return true;
  }
  return false;
}

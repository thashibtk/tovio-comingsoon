"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { DISTRICTS, safePath } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import { isMobileNumber, mobileDigits } from "@/lib/phone";
import { createClient } from "@/lib/supabase/client";
import type { EmployerProfile } from "@/lib/types";

const DESIGNATIONS = ["contractor", "engineer", "builder", "supervisor", "company", "homeowner", "other"] as const;

export default function EmployerForm({
  userId,
  authEmail,
  employer,
  nextPath,
}: {
  userId: string;
  authEmail: string;
  employer: EmployerProfile | null;
  nextPath?: string | null;
}) {
  const { t, lang } = useI18n();
  const router = useRouter();
  const [fullName, setFullName] = useState(employer?.full_name ?? "");
  const [designation, setDesignation] = useState(employer?.designation ?? "");
  const [company, setCompany] = useState(employer?.company ?? "");
  const [phone, setPhone] = useState(employer?.phone ?? "");
  const [district, setDistrict] = useState(employer?.district ?? "");
  const [town, setTown] = useState(employer?.town ?? "");
  const [promo, setPromo] = useState(employer?.promo_consent ?? false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaved(false);
    setError("");
    if (!fullName.trim() || !designation || !district || !town.trim()) {
      setError(t.errors.required);
      return;
    }
    if (!isMobileNumber(phone)) {
      setError(t.errors.phone);
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const payload = {
      user_id: userId,
      full_name: fullName.trim(),
      email: authEmail,
      designation,
      company: company.trim() || null,
      phone: mobileDigits(phone),
      district,
      town: town.trim(),
      promo_consent: promo,
    };

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ account_type: "employer", language: lang })
      .eq("id", userId);

    const write = employer
      ? supabase.from("employer_profiles").update(payload).eq("id", employer.id)
      : supabase.from("employer_profiles").insert(payload);

    const { error: saveError } = await write;
    setLoading(false);

    if (profileError || saveError) {
      setError(`${t.errors.saveFailed} ${(profileError || saveError)?.message ?? ""}`.trim());
      return;
    }

    setSaved(true);
    const destination = safePath(nextPath);
    if (destination) {
      window.location.assign(destination);
      return;
    }
    router.refresh();
  }

  return (
    <form className="setup" onSubmit={onSubmit}>
      <section className="setup-block">
        <header>
          <p className="setup-kicker">1</p>
          <h2>{t.fields.sectionYou}</h2>
        </header>
        <div className="setup-grid">
          <label>
            <span>{t.fields.fullName}</span>
            <input className="form-input" value={fullName} onChange={(event) => setFullName(event.target.value)} required />
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
            <small>{t.fields.phoneEnquiry}</small>
          </label>
          <label className="span-2">
            <span>{t.fields.email}</span>
            <span className="locked-field">
              <input value={authEmail} readOnly aria-readonly="true" tabIndex={-1} />
              <small>{t.fields.emailLocked}</small>
            </span>
          </label>
          <label>
            <span>{t.fields.designation}</span>
            <select className="form-input" value={designation} onChange={(event) => setDesignation(event.target.value)} required>
              <option value="">{t.common.select}</option>
              {DESIGNATIONS.map((item) => (
                <option key={item} value={item}>
                  {t.designation[item]}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>
              {t.fields.company} <em>({t.fields.optional})</em>
            </span>
            <input className="form-input" value={company ?? ""} onChange={(event) => setCompany(event.target.value)} />
          </label>
        </div>
      </section>
      <section className="setup-block">
        <header>
          <p className="setup-kicker">2</p>
          <h2>{t.fields.sectionPlace}</h2>
        </header>
        <div className="setup-grid">
          <label>
            <span>{t.fields.district}</span>
            <select className="form-input" value={district} onChange={(event) => setDistrict(event.target.value)} required>
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
            <input className="form-input" value={town} onChange={(event) => setTown(event.target.value)} required />
          </label>
        </div>
        <label className="consent">
          <input type="checkbox" checked={promo} onChange={(event) => setPromo(event.target.checked)} />
          <span>
            {t.fields.promo}
            <small>{t.fields.promoNote}</small>
          </span>
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

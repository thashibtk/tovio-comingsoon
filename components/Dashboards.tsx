"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import EmployerForm from "./EmployerForm";
import WorkerForm from "./WorkerForm";
import { districtName } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import { availabilityLabel, categoryName, designationLabel, skillLabel, statusLabel, workLabel } from "@/lib/labels";
import { phoneHref } from "@/lib/phone";
import { createClient } from "@/lib/supabase/client";
import type {
  AccountType,
  Category,
  EmployerProfile,
  EnquiryStatus,
  HiringEnquiry,
  WorkerProfile,
  WorkerSkill,
} from "@/lib/types";

const STATUSES: EnquiryStatus[] = ["new", "viewed", "accepted", "declined", "closed"];

export function WorkerDashboard({
  userId,
  email,
  accountType,
  categories,
  worker,
  skills,
  enquiries,
}: {
  userId: string;
  email: string;
  accountType: Extract<AccountType, "worker" | "agent">;
  categories: Category[];
  worker: WorkerProfile;
  skills: WorkerSkill[];
  enquiries: HiringEnquiry[];
}) {
  const { t, lang } = useI18n();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const isAgent = accountType === "agent";
  const fresh = enquiries.filter((enquiry) => enquiry.status === "new").length;
  const workforce = skills.reduce((sum, skill) => sum + skill.total_count, 0);
  const ready = skills.reduce((sum, skill) => sum + skill.available_count, 0);

  async function updateStatus(id: string, status: string) {
    const supabase = createClient();
    await supabase.from("hiring_enquiries").update({ status }).eq("id", id);
    router.refresh();
  }

  return (
    <div className="desk">
      <ProfileHero
        name={worker.name}
        role={isAgent ? t.account.agent : t.account.individual}
        place={`${worker.town}, ${districtName(worker.district, lang)}`}
        photo={worker.photo_url}
        pills={
          <>
            <span className={`pill pill-${worker.availability}`}>{availabilityLabel(t, worker.availability)}</span>
            {worker.work_type ? <span className="pill">{workLabel(t, worker.work_type)}</span> : null}
          </>
        }
        actions={
          <>
            <button className="btn btn-dark" type="button" onClick={() => setEditing((openEditor) => !openEditor)}>
              {editing ? t.dashboard.hideEdit : t.dashboard.edit}
            </button>
            <Link className="btn btn-line-dark" href={`/workers/${worker.id}`}>
              {t.dashboard.publicProfile}
            </Link>
          </>
        }
      />

      <div className="desk-stats">
        {isAgent ? (
          <>
            <Stat value={String(workforce)} label={t.dashboard.workforce} />
            <Stat value={String(ready)} label={t.dashboard.availableNow} />
          </>
        ) : (
          <>
            <Stat value={availabilityLabel(t, worker.availability)} label={t.fields.availability} />
            <Stat value={String(skills.length)} label={t.dashboard.trades} />
          </>
        )}
        <Stat value={String(fresh)} label={t.dashboard.newEnquiries} />
      </div>

      <div className="desk-layout">
        <section className="desk-panel">
          <h2>{t.dashboard.received}</h2>
          <EnquiryCards
            enquiries={enquiries}
            categories={categories}
            empty={t.dashboard.emptyReceived}
            onStatus={updateStatus}
            party={(enquiry) => (
              <>
                <strong>{enquiry.employer_name}</strong>
                <span>
                  {enquiry.employer_email}
                  {enquiry.employer_phone ? ` · ${enquiry.employer_phone}` : ""}
                </span>
                {enquiry.employer_company && enquiry.employer_company !== enquiry.employer_name ? (
                  <span>{enquiry.employer_company}</span>
                ) : null}
              </>
            )}
          />
        </section>
        <aside className="desk-panel">
          <h2>{t.dashboard.snapshot}</h2>
          <Fact label={t.fields.email} value={email || worker.email || "—"} />
          <Fact label={t.fields.phone} value={worker.phone || "—"} />
          <Fact label={t.fields.experience} value={worker.experience || "—"} />
          <Fact
            label={t.fields.preferred}
            value={
              worker.preferred_districts?.filter((id) => id !== worker.district).length
                ? worker.preferred_districts
                    .filter((id) => id !== worker.district)
                    .map((id) => districtName(id, lang))
                    .join(", ")
                : "—"
            }
          />
          <p className="setup-label">{t.dashboard.trades}</p>
          <div className="trade-cloud">
            {skills.map((skill) => {
              const category = categories.find((item) => item.id === skill.category_id);
              if (!category) return null;
              const detail = isAgent
                ? `${skill.available_count}/${skill.total_count}`
                : skillLabel(t, skill.skill_level || worker.skill_level);
              return (
                <span key={skill.category_id} className="trade-chip on">
                  {categoryName(category, lang)}
                  {detail && detail !== t.skill.none ? ` · ${detail}` : ""}
                </span>
              );
            })}
          </div>
          {worker.description ? <p className="desk-note">{worker.description}</p> : null}
          <p className="muted">{t.fields.phoneNote}</p>
        </aside>
      </div>

      {editing ? (
        <EditorModal title={t.dashboard.edit} closeLabel={t.dashboard.hideEdit} onClose={() => setEditing(false)}>
          <WorkerForm
            userId={userId}
            accountType={accountType}
            categories={categories}
            worker={worker}
            skills={skills}
            defaultEmail={email}
          />
        </EditorModal>
      ) : null}
    </div>
  );
}

export function EmployerDashboard({
  userId,
  email,
  categories,
  employer,
  enquiries,
  workerNames,
}: {
  userId: string;
  email: string;
  categories: Category[];
  employer: EmployerProfile;
  enquiries: HiringEnquiry[];
  workerNames: Record<string, { name: string; district: string }>;
}) {
  const { t, lang } = useI18n();
  const [editing, setEditing] = useState(false);
  const fresh = enquiries.filter((enquiry) => enquiry.status === "new").length;
  const open = enquiries.filter((enquiry) => enquiry.status === "new" || enquiry.status === "viewed").length;

  return (
    <div className="desk">
      <ProfileHero
        name={employer.full_name}
        role={designationLabel(t, employer.designation) || t.account.employer}
        place={`${employer.town}, ${districtName(employer.district, lang)}`}
        photo={null}
        pills={employer.company ? <span className="pill">{employer.company}</span> : null}
        actions={
          <>
            <button className="btn btn-dark" type="button" onClick={() => setEditing((openEditor) => !openEditor)}>
              {editing ? t.dashboard.hideEdit : t.dashboard.edit}
            </button>
            <Link className="btn btn-line-dark" href="/find">
              {t.dashboard.findMore}
            </Link>
          </>
        }
      />

      <div className="desk-stats">
        <Stat value={String(enquiries.length)} label={t.dashboard.sentCount} />
        <Stat value={String(fresh)} label={t.dashboard.newEnquiries} />
        <Stat value={String(open)} label={t.dashboard.openEnquiries} />
      </div>

      <div className="desk-layout">
        <section className="desk-panel">
          <h2>{t.dashboard.sent}</h2>
          <EnquiryCards
            enquiries={enquiries}
            categories={categories}
            empty={t.dashboard.emptySent}
            party={(enquiry) => {
              const person = workerNames[enquiry.worker_profile_id];
              return (
                <>
                  <strong>{person?.name ?? t.dashboard.forWorker}</strong>
                  {person ? <span>{districtName(person.district, lang)}</span> : null}
                  <Link href={`/workers/${enquiry.worker_profile_id}`}>{t.find.view}</Link>
                </>
              );
            }}
          />
        </section>
        <aside className="desk-panel">
          <h2>{t.dashboard.snapshot}</h2>
          <Fact label={t.fields.email} value={email} />
          <Fact label={t.fields.phone} value={employer.phone} />
          <Fact label={t.fields.designation} value={designationLabel(t, employer.designation)} />
          <Fact label={t.fields.company} value={employer.company || "—"} />
          <Link className="btn btn-dark" href="/find">
            {t.dashboard.findMore}
          </Link>
        </aside>
      </div>

      {editing ? (
        <EditorModal title={t.dashboard.edit} closeLabel={t.dashboard.hideEdit} onClose={() => setEditing(false)}>
          <EmployerForm userId={userId} authEmail={email} employer={employer} />
        </EditorModal>
      ) : null}
    </div>
  );
}

function EditorModal({
  title,
  closeLabel,
  onClose,
  children,
}: {
  title: string;
  closeLabel: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="editor-modal" role="presentation" onClick={onClose}>
      <div
        className="editor-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="editor-dialog-bar">
          <h2>{title}</h2>
          <button className="editor-close" type="button" onClick={onClose} aria-label={closeLabel}>
            ×
          </button>
        </div>
        <div className="editor-dialog-body">{children}</div>
      </div>
    </div>
  );
}

function ProfileHero({
  name,
  role,
  place,
  photo,
  pills,
  actions,
}: {
  name: string;
  role: string;
  place: string;
  photo: string | null;
  pills?: ReactNode;
  actions: ReactNode;
}) {
  const initial = name.trim().slice(0, 1).toUpperCase() || "T";
  return (
    <header className="desk-hero">
      {photo ? <img className="desk-avatar" src={photo} alt="" /> : <span className="desk-fallback">{initial}</span>}
      <div>
        <p className="desk-role">{role}</p>
        <h1>{name}</h1>
        <p className="desk-meta">{place}</p>
        {pills ? <div className="desk-pills">{pills}</div> : null}
      </div>
      <div className="desk-actions">{actions}</div>
    </header>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <article className="stat">
      <strong>{value}</strong>
      <span>{label}</span>
    </article>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="fact-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function EnquiryCards({
  enquiries,
  categories,
  empty,
  party,
  onStatus,
}: {
  enquiries: HiringEnquiry[];
  categories: Category[];
  empty: string;
  party: (enquiry: HiringEnquiry) => ReactNode;
  onStatus?: (id: string, status: string) => void;
}) {
  const { t, lang } = useI18n();
  if (enquiries.length === 0) return <p className="empty-copy">{empty}</p>;

  return (
    <div className="card-list">
      {enquiries.map((enquiry) => {
        const category = categories.find((item) => item.id === enquiry.category_id);
        const rawPhone = enquiry.employer_phone?.trim();
        const callHref =
          onStatus && rawPhone
            ? phoneHref(rawPhone) || `tel:${rawPhone.replace(/\s+/g, "")}`
            : null;

        return (
          <article key={enquiry.id} className="enquiry-card">
            <div className="enquiry-top">
              <div className="person-main">{party(enquiry)}</div>
              <span className={`pill pill-status pill-${enquiry.status}`}>{statusLabel(t, enquiry.status)}</span>
            </div>
            <p className="desk-meta">
              {category ? categoryName(category, lang) : t.dashboard.category}
              {" · "}
              {t.dashboard.quantity}: {enquiry.quantity}
            </p>
            <p className="desk-meta">
              {districtName(enquiry.district, lang)}
              {enquiry.location ? `, ${enquiry.location}` : ""}
              {enquiry.start_date ? ` · ${enquiry.start_date}` : ""}
              {enquiry.work_type ? ` · ${workLabel(t, enquiry.work_type)}` : ""}
            </p>
            {enquiry.message ? <p>{enquiry.message}</p> : null}
            {onStatus || callHref ? (
              <div className="enquiry-footer">
                {onStatus ? (
                  <label className="status-field">
                    <span>{t.dashboard.status}</span>
                    <select
                      className="form-input"
                      value={enquiry.status}
                      onChange={(event) => onStatus(enquiry.id, event.target.value)}
                    >
                      {STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {statusLabel(t, status)}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}
                {callHref ? (
                  <a
                    className="btn btn-dark enquiry-call-btn"
                    href={callHref}
                    title={`${t.profileView.call}: ${enquiry.employer_phone}`}
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <span>{t.profileView.call}</span>
                  </a>
                ) : null}
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}

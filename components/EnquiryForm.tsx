"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DISTRICTS } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import type { EmployerProfile, PublicSkill, PublicWorker } from "@/lib/types";

export default function EnquiryForm({
  worker,
  skills,
  employer,
  accountType,
}: {
  worker: PublicWorker;
  skills: PublicSkill[];
  employer: EmployerProfile | null;
  accountType: string | null;
}) {
  const { t, lang } = useI18n();
  const router = useRouter();
  const [categoryId, setCategoryId] = useState(skills[0]?.category_id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [district, setDistrict] = useState(worker.district);
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [workType, setWorkType] = useState("any");
  const [duration, setDuration] = useState("");
  const [budget, setBudget] = useState("");
  const [message, setMessage] = useState("");
  const [contactPreference, setContactPreference] = useState("phone-call");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  if (accountType && accountType !== "employer") {
    return <p className="modal-error">{t.enquiry.wrongRole}</p>;
  }

  if (!employer) {
    return (
      <div className="notice">
        <p>{t.enquiry.needEmployer}</p>
        <Link className="btn btn-dark" href={`/onboarding?role=employer&next=/enquiry/${worker.id}`}>
          {t.onboarding.continue}
        </Link>
      </div>
    );
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!employer) return;
    setError("");
    if (!consent) {
      setError(t.errors.consent);
      return;
    }
    if (!categoryId || !district || quantity < 1) {
      setError(t.errors.required);
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const preference = contactPreference === "phone-call" ? "call" : contactPreference;
    const { error: insertError } = await supabase.from("hiring_enquiries").insert({
      employer_id: employer.id,
      worker_profile_id: worker.id,
      category_id: categoryId,
      quantity,
      district,
      location: location.trim() || null,
      start_date: startDate || null,
      work_type: workType,
      duration: duration.trim() || null,
      budget: budget.trim() || null,
      message: message.trim() || null,
      contact_preference: preference,
      consent: true,
      employer_name: employer.full_name,
      employer_email: employer.email,
      employer_phone: employer.phone,
      employer_company: employer.company,
    });
    setLoading(false);
    if (insertError) {
      setError(t.errors.saveFailed);
      return;
    }
    setDone(true);
    router.refresh();
  }

  if (done) {
    return (
      <div className="notice">
        <p>{t.enquiry.success}</p>
        <Link className="btn btn-dark" href="/dashboard">
          {t.nav.dashboard}
        </Link>
      </div>
    );
  }

  return (
    <form className="stack-form" onSubmit={onSubmit}>
      <div className="readonly-card">
        <p>
          {employer.full_name}
          {employer.company ? ` · ${employer.company}` : ""}
        </p>
        <p>
          {employer.email}
          <br />
          {employer.phone}
        </p>
      </div>
      <label>
        <span>{t.find.category}</span>
        <select className="form-input" value={categoryId} onChange={(event) => setCategoryId(event.target.value)} required>
          {skills.map((skill) => (
            <option key={skill.category_id} value={skill.category_id}>
              {lang === "hi" ? skill.name_hi : skill.name_en}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>{t.enquiry.quantity}</span>
        <input
          className="form-input"
          type="number"
          min={1}
          value={quantity}
          onChange={(event) => setQuantity(Number(event.target.value))}
          required
        />
      </label>
      <div className="form-row">
        <label>
          <span>{t.fields.district}</span>
          <select className="form-input" value={district} onChange={(event) => setDistrict(event.target.value)} required>
            {DISTRICTS.map((item) => (
              <option key={item.id} value={item.id}>
                {item[lang]}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>{t.enquiry.location}</span>
          <input className="form-input" value={location} onChange={(event) => setLocation(event.target.value)} />
        </label>
      </div>
      <div className="form-row">
        <label>
          <span>{t.enquiry.start}</span>
          <input className="form-input" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
        </label>
        <label>
          <span>{t.fields.workType}</span>
          <select className="form-input" value={workType} onChange={(event) => setWorkType(event.target.value)}>
            <option value="daily">{t.workType.daily}</option>
            <option value="contract">{t.workType.contract}</option>
            <option value="monthly">{t.workType.monthly}</option>
            <option value="any">{t.workType.any}</option>
          </select>
        </label>
      </div>
      <label>
        <span>
          {t.enquiry.duration} <em>({t.fields.optional})</em>
        </span>
        <input className="form-input" value={duration} onChange={(event) => setDuration(event.target.value)} />
      </label>
      <label>
        <span>
          {t.enquiry.budget} <em>({t.fields.optional})</em>
        </span>
        <input className="form-input" value={budget} onChange={(event) => setBudget(event.target.value)} />
      </label>
      <label>
        <span>
          {t.enquiry.message} <em>({t.fields.optional})</em>
        </span>
        <textarea className="form-input" rows={4} value={message} onChange={(event) => setMessage(event.target.value)} />
      </label>
      <label>
        <span>{t.enquiry.contactPref}</span>
        <select
          className="form-input"
          value={contactPreference}
          onChange={(event) => setContactPreference(event.target.value)}
        >
          <option value="email">{t.enquiry.email}</option>
          <option value="phone-call">{t.enquiry.call}</option>
          <option value="whatsapp">{t.enquiry.whatsapp}</option>
        </select>
      </label>
      <label className="consent">
        <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} required />
        <span>{t.enquiry.consent}</span>
      </label>
      {error ? <p className="modal-error">{error}</p> : null}
      <button className="btn btn-dark" type="submit" disabled={loading}>
        {loading ? t.enquiry.sending : t.enquiry.send}
      </button>
    </form>
  );
}

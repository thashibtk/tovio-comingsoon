"use client";

import Link from "next/link";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { phoneHref, phoneLabel } from "@/lib/phone";

export default function ContactReveal({
  workerId,
  signedIn,
  nextPath,
}: {
  workerId: string;
  signedIn: boolean;
  nextPath: string;
}) {
  const { t } = useI18n();
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  async function showContact() {
    if (loading) return;
    setLoading(true);
    setNote("");
    try {
      const response = await fetch(`/api/workers/${workerId}/phone`);
      if (response.status === 401) {
        window.location.assign(`/login?next=${encodeURIComponent(nextPath)}`);
        return;
      }
      const data = (await response.json()) as { phone?: string | null };
      if (!data.phone) {
        setNote(t.profileView.noNumber);
        return;
      }
      setPhone(data.phone);
    } catch {
      setNote(t.errors.generic);
    } finally {
      setLoading(false);
    }
  }

  if (!signedIn) {
    return (
      <Link className="contact-gate" href={`/login?next=${encodeURIComponent(nextPath)}`}>
        {t.profileView.loginContact}
      </Link>
    );
  }

  const href = phone ? phoneHref(phone) : null;
  if (href) {
    return (
      <a className="contact-open" href={href}>
        {t.profileView.call} {phoneLabel(phone)}
      </a>
    );
  }

  return (
    <div className="contact-reveal">
      <button className="contact-gate" type="button" onClick={() => void showContact()} disabled={loading}>
        {loading ? t.common.loading : t.profileView.showContact}
      </button>
      {note ? <p className="muted">{note}</p> : null}
    </div>
  );
}

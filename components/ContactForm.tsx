"use client";

import { FormEvent, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

const TOPICS = ["general", "worker", "employer", "support"] as const;

export default function ContactForm() {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState<(typeof TOPICS)[number]>("general");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!isSupabaseConfigured()) {
      setError(t.auth.notConfigured);
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error: insertError } = await supabase.from("contact_messages").insert({
      name: name.trim(),
      email: email.trim(),
      topic,
      message: message.trim(),
    });
    setLoading(false);
    if (insertError) {
      setError(t.errors.saveFailed);
      return;
    }
    setDone(true);
    setName("");
    setEmail("");
    setMessage("");
  }

  if (done) {
    return (
      <div className="contact-card contact-done">
        <span className="setup-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </span>
        <p className="form-note">{t.contact.success}</p>
        <button className="btn btn-line-dark" type="button" onClick={() => setDone(false)}>
          {t.contact.send}
        </button>
      </div>
    );
  }

  return (
    <form className="contact-card" onSubmit={onSubmit}>
      <header className="setup-heading">
        <span className="setup-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="M3 7l9 7 9-7" />
          </svg>
        </span>
        <div>
          <p className="setup-kicker">01</p>
          <h2>{t.contact.message}</h2>
        </div>
      </header>

      <div className="setup-grid">
        <label>
          <span>{t.contact.name}</span>
          <input className="form-input" value={name} onChange={(event) => setName(event.target.value)} required />
        </label>
        <label>
          <span>{t.contact.email}</span>
          <input
            className="form-input"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <div className="span-2">
          <span className="setup-label">{t.contact.topic}</span>
          <div className="trade-cloud">
            {TOPICS.map((item) => (
              <button
                key={item}
                type="button"
                className={topic === item ? "trade-chip on" : "trade-chip"}
                aria-pressed={topic === item}
                onClick={() => setTopic(item)}
              >
                {t.contact[item]}
              </button>
            ))}
          </div>
        </div>
        <label className="span-2">
          <span>{t.contact.message}</span>
          <textarea className="form-input" rows={6} value={message} onChange={(event) => setMessage(event.target.value)} required />
        </label>
      </div>

      <div className="setup-save">
        <div>{error ? <p className="modal-error">{error}</p> : null}</div>
        <button className="btn btn-dark" type="submit" disabled={loading}>
          {loading ? t.contact.sending : t.contact.send}
        </button>
      </div>
    </form>
  );
}

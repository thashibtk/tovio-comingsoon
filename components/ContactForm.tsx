"use client";

import { FormEvent, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function ContactForm() {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("general");
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

  if (done) return <p className="form-note">{t.contact.success}</p>;

  return (
    <form className="stack-form" onSubmit={onSubmit}>
      <label>
        <span>{t.contact.name}</span>
        <input className="form-input" value={name} onChange={(event) => setName(event.target.value)} required />
      </label>
      <label>
        <span>{t.contact.email}</span>
        <input className="form-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
      </label>
      <label>
        <span>{t.contact.topic}</span>
        <select className="form-input" value={topic} onChange={(event) => setTopic(event.target.value)}>
          <option value="general">{t.contact.general}</option>
          <option value="worker">{t.contact.worker}</option>
          <option value="employer">{t.contact.employer}</option>
          <option value="support">{t.contact.support}</option>
        </select>
      </label>
      <label>
        <span>{t.contact.message}</span>
        <textarea className="form-input" rows={5} value={message} onChange={(event) => setMessage(event.target.value)} required />
      </label>
      {error ? <p className="modal-error">{error}</p> : null}
      <button className="btn btn-dark" type="submit" disabled={loading}>
        {loading ? t.contact.sending : t.contact.send}
      </button>
    </form>
  );
}

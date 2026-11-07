"use client";

import { useId, useState } from "react";

export default function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
  showLabel,
  hideLabel,
  minLength = 6,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  showLabel: string;
  hideLabel: string;
  minLength?: number;
}) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  return (
    <label htmlFor={id}>
      <span>{label}</span>
      <span className="password-field">
        <input
          id={id}
          className="form-input"
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          required
          minLength={minLength}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <button
          className="password-toggle"
          type="button"
          aria-label={visible ? hideLabel : showLabel}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </span>
    </label>
  );
}

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.8" />
      <path d="M10.5 6.2A10.7 10.7 0 0 1 12 6c6.5 0 10 6 10 6a18.2 18.2 0 0 1-3.2 3.8" stroke="currentColor" strokeWidth="1.8" />
      <path d="M6.1 7.6C3.6 9.3 2 12 2 12s3.5 6 10 6c1.2 0 2.3-.2 3.3-.6" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

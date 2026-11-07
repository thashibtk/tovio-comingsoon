"use client";

import { FormEvent, useState } from "react";
import { useCooldown } from "@/lib/use-cooldown";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { requestSignupCode, resendSignupCode, type SignupCodeResult } from "@/app/auth/otp/actions";
import OtpInput from "@/components/OtpInput";
import PasswordField from "@/components/PasswordField";
import { useI18n } from "@/lib/i18n";
import { safePath } from "@/lib/data";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function AuthForm({ initialMode }: { initialMode: "signin" | "signup" }) {
  const { t } = useI18n();
  const router = useRouter();
  const params = useSearchParams();
  const next = safePath(params.get("next"));
  const role = params.get("role");
  const [mode, setMode] = useState(initialMode);
  const [step, setStep] = useState<"details" | "otp">("details");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [code, setCode] = useState("");
  const [verifyType, setVerifyType] = useState<"signup" | "magiclink">("signup");
  const [error, setError] = useState(params.get("error") ? t.auth.failed : "");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const resendCooldown = useCooldown(30);

  function rememberDestination() {
    const safeRole = role === "worker" || role === "agent" || role === "employer" ? role : "";
    document.cookie = `tovio_next=${encodeURIComponent(next ?? "")};path=/;max-age=900;samesite=lax`;
    document.cookie = `tovio_role=${encodeURIComponent(safeRole)};path=/;max-age=900;samesite=lax`;
    const redirect = new URL("/auth/callback", window.location.origin);
    if (next) redirect.searchParams.set("next", next);
    if (safeRole) redirect.searchParams.set("role", safeRole);
    return redirect.toString();
  }

  function codeError(reason: Extract<SignupCodeResult, { ok: false }>["reason"]) {
    if (reason === "exists") return t.auth.alreadyRegistered;
    if (reason === "mail") return t.auth.mailFailed;
    return t.auth.failed;
  }

  function continuePath() {
    const search = new URLSearchParams();
    if (next) search.set("next", next);
    if (role === "worker" || role === "agent" || role === "employer") search.set("role", role);
    const query = search.toString();
    return `/auth/continue${query ? `?${query}` : ""}`;
  }

  async function signInWithGoogle() {
    setError("");
    setNotice("");
    if (!isSupabaseConfigured()) {
      setError(t.auth.notConfigured);
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: rememberDestination() },
    });
    if (authError) {
      setError(authError.message);
      setLoading(false);
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setNotice("");
    if (!isSupabaseConfigured()) {
      setError(t.auth.notConfigured);
      return;
    }
    if (password.length < 6) {
      setError(t.auth.passwordShort);
      return;
    }
    if (mode === "signup" && password !== confirm) {
      setError(t.auth.passwordMismatch);
      return;
    }

    setLoading(true);
    const supabase = createClient();

    if (mode === "signup") {
      const result = await requestSignupCode(email, password);
      if (!result.ok) {
        setError(codeError(result.reason));
        setLoading(false);
        return;
      }
      setVerifyType(result.verifyType);
      setStep("otp");
      setNotice(t.auth.checkEmail);
      resendCooldown.start();
      setLoading(false);
      return;
    } else {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }
    }

    router.push(continuePath());
    router.refresh();
  }

  async function confirmCode(event: FormEvent) {
    event.preventDefault();
    setError("");
    setNotice("");
    if (code.trim().length < 6) {
      setError(t.auth.checkEmail);
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.verifyOtp({
      email,
      token: code.replace(/\D/g, ""),
      type: verifyType,
    });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }
    router.push(continuePath());
    router.refresh();
  }

  async function resendCode() {
    if (resendCooldown.left > 0) return;
    setError("");
    setNotice("");
    setLoading(true);
    const result = await resendSignupCode(email);
    setLoading(false);
    if (!result.ok) {
      setError(codeError(result.reason));
      return;
    }
    setVerifyType(result.verifyType);
    setNotice(t.auth.resendSent);
    resendCooldown.start();
  }

  return (
    <div className="auth-card">
      <h1>{step === "otp" ? t.auth.otpSubmit : mode === "signup" ? t.auth.signUpTitle : t.auth.signInTitle}</h1>
      <p className="lede">{step === "otp" ? t.auth.checkEmail : t.auth.lead}</p>
      {step === "otp" ? (
        <form className="stack-form" onSubmit={confirmCode}>
          <label>
            <span>{t.auth.otpLabel}</span>
            <OtpInput value={code} onChange={setCode} label={t.auth.otpLabel} />
          </label>
          {error ? <p className="modal-error">{error}</p> : null}
          {notice ? <p className="form-note">{notice}</p> : null}
          <button className="btn btn-dark" type="submit" disabled={loading}>
            {loading ? t.auth.working : t.auth.otpSubmit}
          </button>
          <button className="text-button" type="button" onClick={resendCode} disabled={loading || resendCooldown.left > 0}>
            {resendCooldown.left > 0
              ? t.auth.resendWait.replace("{seconds}", String(resendCooldown.left))
              : t.auth.resend}
          </button>
        </form>
      ) : null}
      {step === "details" ? (
        <>
      <button className="btn btn-google" type="button" onClick={signInWithGoogle} disabled={loading}>
        <GoogleMark />
        {t.auth.google}
      </button>
      <p className="auth-or">{t.auth.or}</p>
      <form className="stack-form" onSubmit={onSubmit}>
        <label>
          <span>{t.auth.email}</span>
          <input
            className="form-input"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <PasswordField
          label={t.auth.password}
          value={password}
          onChange={setPassword}
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          showLabel={t.auth.showPassword}
          hideLabel={t.auth.hidePassword}
        />
        {mode === "signup" ? (
          <PasswordField
            label={t.auth.confirmPassword}
            value={confirm}
            onChange={setConfirm}
            autoComplete="new-password"
            showLabel={t.auth.showPassword}
            hideLabel={t.auth.hidePassword}
          />
        ) : null}
        {mode === "signin" ? (
          <Link className="text-button" href="/forgot-password">
            {t.auth.forgot}
          </Link>
        ) : null}
        {error ? <p className="modal-error">{error}</p> : null}
        {notice ? <p className="form-note">{notice}</p> : null}
        <button className="btn btn-dark" type="submit" disabled={loading}>
          {loading ? t.auth.working : mode === "signup" ? t.auth.submitSignUp : t.auth.submitSignIn}
        </button>
      </form>
      <button
        className="text-button"
        type="button"
        onClick={() => {
          setMode(mode === "signup" ? "signin" : "signup");
          setStep("details");
          setError("");
          setNotice("");
        }}
      >
        {mode === "signup" ? t.auth.switchToSignIn : t.auth.switchToSignUp}
      </button>
        </>
      ) : null}
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.6 9.2c0-.6-.1-1.2-.2-1.8H9v3.4h4.8c-.2 1.1-.9 2.1-1.9 2.7v2.2h3.1c1.8-1.7 2.6-4.1 2.6-6.5z" />
      <path fill="#34A853" d="M9 18c2.4 0 4.5-.8 6-2.2l-3.1-2.2c-.8.6-1.9.9-2.9.9-2.2 0-4.1-1.5-4.8-3.5H1v2.3C2.5 16.1 5.5 18 9 18z" />
      <path fill="#FBBC05" d="M4.2 10.9c-.2-.6-.3-1.2-.3-1.9s.1-1.3.3-1.9V4.8H1C.4 6.1 0 7.5 0 9s.4 2.9 1 4.2l3.2-2.3z" />
      <path fill="#EA4335" d="M9 3.6c1.3 0 2.5.5 3.4 1.3l2.6-2.6C13.5.9 11.4 0 9 0 5.5 0 2.5 1.9 1 4.8l3.2 2.3C4.9 5.1 6.8 3.6 9 3.6z" />
    </svg>
  );
}

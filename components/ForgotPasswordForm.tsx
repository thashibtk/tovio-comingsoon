"use client";

import { FormEvent, useState } from "react";
import { useCooldown } from "@/lib/use-cooldown";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { requestPasswordReset } from "@/app/auth/reset/actions";
import OtpInput from "@/components/OtpInput";
import PasswordField from "@/components/PasswordField";
import { useI18n } from "@/lib/i18n";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function ForgotPasswordForm() {
  const { t } = useI18n();
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code" | "password">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const resendCooldown = useCooldown(30);

  async function sendCode(event?: FormEvent) {
    event?.preventDefault();
    setError("");
    setNotice("");
    if (!isSupabaseConfigured()) {
      setError(t.auth.notConfigured);
      return;
    }
    setLoading(true);
    const result = await requestPasswordReset(email);
    setLoading(false);
    if (!result.ok) {
      setError(
        result.reason === "missing" ? t.auth.notRegistered : result.reason === "mail" ? t.auth.mailFailed : t.auth.failed,
      );
      return;
    }
    setStep("code");
    setNotice(step === "code" ? t.auth.resendSent : t.auth.checkEmail);
    resendCooldown.start();
  }

  async function confirmCode(event: FormEvent) {
    event.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.verifyOtp({
      email,
      token: code.replace(/\D/g, ""),
      type: "recovery",
    });
    setLoading(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    setStep("password");
  }

  async function savePassword(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (password.length < 6) {
      setError(t.auth.passwordShort);
      return;
    }
    if (password !== confirm) {
      setError(t.auth.passwordMismatch);
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    router.push("/auth/continue");
    router.refresh();
  }

  return (
    <div className="auth-card">
      <h1>{t.auth.forgotTitle}</h1>
      <p className="lede">
        {step === "password" ? t.auth.newPassword : step === "code" ? t.auth.checkEmail : t.auth.forgotLead}
      </p>

      {step === "email" ? (
        <form className="stack-form" onSubmit={sendCode}>
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
          {error ? <p className="modal-error">{error}</p> : null}
          <button className="btn btn-dark" type="submit" disabled={loading}>
            {loading ? t.auth.working : t.auth.sendCode}
          </button>
        </form>
      ) : null}

      {step === "code" ? (
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
          <button
            className="text-button"
            type="button"
            onClick={() => sendCode()}
            disabled={loading || resendCooldown.left > 0}
          >
            {resendCooldown.left > 0
              ? t.auth.resendWait.replace("{seconds}", String(resendCooldown.left))
              : t.auth.resend}
          </button>
        </form>
      ) : null}

      {step === "password" ? (
        <form className="stack-form" onSubmit={savePassword}>
          <PasswordField
            label={t.auth.newPassword}
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            showLabel={t.auth.showPassword}
            hideLabel={t.auth.hidePassword}
          />
          <PasswordField
            label={t.auth.confirmPassword}
            value={confirm}
            onChange={setConfirm}
            autoComplete="new-password"
            showLabel={t.auth.showPassword}
            hideLabel={t.auth.hidePassword}
          />
          {error ? <p className="modal-error">{error}</p> : null}
          <button className="btn btn-dark" type="submit" disabled={loading}>
            {loading ? t.auth.working : t.auth.resetSubmit}
          </button>
        </form>
      ) : null}

      <Link className="text-button" href="/login">
        {t.auth.backToSignIn}
      </Link>
    </div>
  );
}

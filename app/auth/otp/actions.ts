"use server";

import { findAuthUser, issueCode, normalizeEmail, type VerifyKind } from "@/lib/auth-mail";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export type SignupCodeResult =
  | { ok: true; verifyType: VerifyKind }
  | { ok: false; reason: "missing" | "exists" | "unavailable" | "mail" };

export async function requestSignupCode(email: string, password: string): Promise<SignupCodeResult> {
  const normalized = normalizeEmail(email);
  if (!normalized.includes("@") || password.length < 6) return { ok: false, reason: "missing" };
  if (!process.env.RESEND_API_KEY?.trim()) return { ok: false, reason: "mail" };

  const existing = await findAuthUser(normalized);
  if (existing?.email_confirmed_at) return { ok: false, reason: "exists" };
  if (existing?.id) {
    const { error } = await getSupabaseAdmin().auth.admin.updateUserById(existing.id, { password });
    if (error) return { ok: false, reason: "unavailable" };
  }

  if (!existing) {
    const created = await issueCode(normalized, "signup", password);
    if (created.ok) return { ok: true, verifyType: "signup" };
    if (created.reason !== "exists") return created;
  }

  const resent = await issueCode(normalized, "magiclink");
  if (!resent.ok) return resent.reason === "missing" ? { ok: false, reason: "exists" } : resent;
  return { ok: true, verifyType: "magiclink" };
}

export async function resendSignupCode(email: string): Promise<SignupCodeResult> {
  const normalized = normalizeEmail(email);
  if (!normalized.includes("@")) return { ok: false, reason: "missing" };
  if (!process.env.RESEND_API_KEY?.trim()) return { ok: false, reason: "mail" };
  const existing = await findAuthUser(normalized);
  if (!existing) return { ok: false, reason: "missing" };
  if (existing.email_confirmed_at) return { ok: false, reason: "exists" };
  const resent = await issueCode(normalized, "magiclink");
  if (!resent.ok) return resent;
  return { ok: true, verifyType: "magiclink" };
}

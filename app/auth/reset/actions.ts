"use server";

import { findAuthUser, issueCode, normalizeEmail } from "@/lib/auth-mail";

export async function requestPasswordReset(email: string) {
  const normalized = normalizeEmail(email);
  if (!normalized.includes("@")) return { ok: false as const, reason: "missing" as const };

  const existing = await findAuthUser(normalized);
  if (!existing) return { ok: false as const, reason: "missing" as const };
  if (!process.env.RESEND_API_KEY?.trim()) return { ok: false as const, reason: "mail" as const };

  const sent = await issueCode(normalized, "recovery");
  if (!sent.ok) return { ok: false as const, reason: sent.reason === "missing" ? ("missing" as const) : sent.reason };
  return { ok: true as const };
}

import { getDict } from "@/lib/locale";
import { getSupabaseAdmin, isAdminConfigured } from "@/lib/supabase-admin";

export type VerifyKind = "signup" | "magiclink";

type AuthUser = {
  id?: string;
  email?: string | null;
  email_confirmed_at?: string | null;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function findAuthUser(email: string): Promise<AuthUser | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  const endpoint = new URL("/auth/v1/admin/users", url);
  endpoint.searchParams.set("filter", email);
  endpoint.searchParams.set("page", "1");
  endpoint.searchParams.set("per_page", "200");
  const response = await fetch(endpoint, {
    headers: { Authorization: `Bearer ${key}`, apikey: key },
    cache: "no-store",
  });
  if (!response.ok) return null;
  const body = (await response.json()) as { users?: AuthUser[] };
  return body.users?.find((user) => user.email?.toLowerCase() === email) ?? null;
}

export async function sendCodeEmail(to: string, code: string, purpose: "signup" | "recovery") {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return false;
  const copy = getDict().auth;
  const subject = purpose === "signup" ? copy.codeSubjectSignup : copy.codeSubjectReset;
  const intro = purpose === "signup" ? copy.codeIntroSignup : copy.codeIntroReset;
  const from = process.env.AUTH_FROM_EMAIL?.trim() || "TOVIO <noreply@tovio.in>";
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html: `<div style="font-family:Georgia,serif;color:#241c12;line-height:1.5"><p>${escapeHtml(intro)}</p><p style="font-size:32px;letter-spacing:8px;font-weight:700;margin:16px 0">${escapeHtml(code)}</p><p>${escapeHtml(copy.codeFooter)}</p></div>`,
    }),
  });
  return response.ok;
}

export async function issueCode(
  email: string,
  purpose: "signup" | "recovery" | "magiclink",
  password?: string,
) {
  if (!isAdminConfigured()) return { ok: false as const, reason: "unavailable" as const };
  const admin = getSupabaseAdmin();
  const generated =
    purpose === "signup"
      ? await admin.auth.admin.generateLink({ type: "signup", email, password: password ?? "" })
      : purpose === "recovery"
        ? await admin.auth.admin.generateLink({ type: "recovery", email })
        : await admin.auth.admin.generateLink({ type: "magiclink", email });
  const code = generated.data?.properties?.email_otp;
  if (generated.error || !code) {
    const already = generated.error?.code === "email_exists" || /already/i.test(generated.error?.message ?? "");
    const missing = generated.error?.code === "user_not_found" || /not found/i.test(generated.error?.message ?? "");
    return { ok: false as const, reason: already ? ("exists" as const) : missing ? ("missing" as const) : ("unavailable" as const) };
  }
  const sent = await sendCodeEmail(email, code, purpose === "recovery" ? "recovery" : "signup");
  if (!sent) return { ok: false as const, reason: "mail" as const };
  return { ok: true as const };
}

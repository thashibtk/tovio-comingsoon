import { redirect } from "next/navigation";
import { loadAccount } from "@/lib/account";
import { safePath } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default async function ContinuePage({
  searchParams,
}: {
  searchParams: { next?: string; role?: string };
}) {
  if (!isSupabaseConfigured()) redirect("/login");

  const account = await loadAccount();
  if (!account.user) redirect("/login");

  const next = safePath(searchParams.next);
  const complete = Boolean(account.worker || account.employer);
  if (!complete) {
    const params = new URLSearchParams();
    if (searchParams.role === "worker" || searchParams.role === "agent" || searchParams.role === "employer") {
      params.set("role", searchParams.role);
    }
    if (next) params.set("next", next);
    redirect(`/onboarding${params.toString() ? `?${params}` : ""}`);
  }

  if (next && !next.startsWith("/onboarding") && !next.startsWith("/login") && !next.startsWith("/register")) {
    redirect(next);
  }
  redirect("/dashboard");
}

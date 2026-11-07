import type { Metadata } from "next";
import { redirect } from "next/navigation";
import OnboardingFlow from "@/components/OnboardingFlow";
import SiteFrame from "@/components/SiteFrame";
import { loadAccount } from "@/lib/account";
import { safePath } from "@/lib/data";
import { getDict } from "@/lib/locale";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: { role?: string; next?: string };
}) {
  const t = getDict();
  if (!isSupabaseConfigured()) redirect("/login");
  const account = await loadAccount();
  if (!account.user) redirect("/login?next=/onboarding");

  return (
    <SiteFrame>
      <section className="setup-page">
        <header className="setup-intro">
          <p className="section-label">{t.product}</p>
          <h1>{t.onboarding.title}</h1>
          <p>{t.onboarding.lead}</p>
        </header>
        <OnboardingFlow
            userId={account.user.id}
            email={account.user.email ?? ""}
            accountType={account.profile?.account_type ?? null}
            hasProfile={Boolean(account.worker || account.employer)}
            categories={account.categories}
            worker={account.worker}
            skills={account.skills}
            employer={account.employer}
            roleHint={searchParams.role}
            nextPath={safePath(searchParams.next)}
          />
      </section>
    </SiteFrame>
  );
}

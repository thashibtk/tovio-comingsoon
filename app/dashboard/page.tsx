import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { EmployerDashboard, WorkerDashboard } from "@/components/Dashboards";
import SiteFrame from "@/components/SiteFrame";
import { loadAccount } from "@/lib/account";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function DashboardPage() {
  if (!isSupabaseConfigured()) redirect("/login");
  const account = await loadAccount();
  if (!account.user) redirect("/login?next=/dashboard");
  if (!account.worker && !account.employer) redirect("/onboarding");

  const isEmployer = account.profile?.account_type === "employer" || Boolean(account.employer && !account.worker);

  return (
    <SiteFrame>
      <section className="section">
        <div className="wrap desk-wrap">
          {isEmployer && account.employer ? (
            <EmployerDashboard
              userId={account.user.id}
              email={account.user.email ?? account.employer.email}
              categories={account.categories}
              employer={account.employer}
              enquiries={account.enquiries}
              workerNames={account.workerNames}
            />
          ) : account.worker ? (
            <WorkerDashboard
              userId={account.user.id}
              email={account.user.email ?? ""}
              accountType={account.profile?.account_type === "agent" ? "agent" : "worker"}
              categories={account.categories}
              worker={account.worker}
              skills={account.skills}
              enquiries={account.enquiries}
            />
          ) : null}
        </div>
      </section>
    </SiteFrame>
  );
}

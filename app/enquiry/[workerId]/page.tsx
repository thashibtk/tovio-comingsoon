import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import EnquiryForm from "@/components/EnquiryForm";
import PageHero from "@/components/PageHero";
import SiteFrame from "@/components/SiteFrame";
import { loadAccount } from "@/lib/account";
import { getDict } from "@/lib/locale";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { PublicSkill, PublicWorker } from "@/lib/types";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function EnquiryPage({ params }: { params: { workerId: string } }) {
  const t = getDict();
  if (!isSupabaseConfigured()) redirect("/login");

  const supabase = createClient();
  const [{ data: worker }, { data: skills }, account] = await Promise.all([
    supabase.from("worker_public").select("*").eq("id", params.workerId).maybeSingle(),
    supabase.from("worker_skills_public").select("*").eq("profile_id", params.workerId),
    loadAccount(),
  ]);

  if (!account.user) redirect(`/login?next=/enquiry/${params.workerId}&role=employer`);
  if (!worker) notFound();

  return (
    <SiteFrame>
      <PageHero kicker={(worker as PublicWorker).name} title={t.enquiry.title} lede={t.enquiry.lead} />
      <section className="section">
        <div className="wrap narrow">
          <EnquiryForm
            worker={worker as PublicWorker}
            skills={(skills ?? []) as PublicSkill[]}
            employer={account.employer}
            accountType={account.profile?.account_type ?? null}
          />
        </div>
      </section>
    </SiteFrame>
  );
}

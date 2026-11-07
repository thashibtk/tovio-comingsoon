import type { Metadata } from "next";
import FindWorkers from "@/components/FindWorkers";
import PageHero from "@/components/PageHero";
import SiteFrame from "@/components/SiteFrame";
import { getDict } from "@/lib/locale";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { Category } from "@/lib/types";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  const t = getDict();
  return { title: t.meta.findTitle, description: t.meta.findDescription };
}

export default async function FindPage() {
  const t = getDict();
  let categories: Category[] = [];
  let signedIn = false;

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    const [{ data }, { data: auth }] = await Promise.all([
      supabase.from("worker_categories").select("*").eq("active", true).order("sort_order"),
      supabase.auth.getUser(),
    ]);
    categories = (data ?? []) as Category[];
    signedIn = Boolean(auth.user);
  }

  return (
    <SiteFrame>
      <PageHero kicker={t.product} title={t.find.title} lede={t.find.lead} />
      <section className="section find-section">
        <div className="wrap">
          <FindWorkers categories={categories} enabled={isSupabaseConfigured()} signedIn={signedIn} />
        </div>
      </section>
    </SiteFrame>
  );
}

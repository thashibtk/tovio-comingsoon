import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import SiteFrame from "@/components/SiteFrame";
import { getDict } from "@/lib/locale";

export function generateMetadata(): Metadata {
  const t = getDict();
  return { title: t.meta.aboutTitle, description: t.meta.aboutDescription };
}

export default function AboutPage() {
  const t = getDict();
  return (
    <SiteFrame>
      <PageHero kicker={t.product} title={t.about.title} />
      <section className="section">
        <div className="wrap prose">
          <p>{t.about.p1}</p>
          <p>{t.about.p2}</p>
          <p>{t.about.p3}</p>
        </div>
      </section>
    </SiteFrame>
  );
}

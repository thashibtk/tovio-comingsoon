import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import SiteFrame from "@/components/SiteFrame";
import { getDict } from "@/lib/locale";

export function generateMetadata(): Metadata {
  const t = getDict();
  return { title: t.meta.termsTitle, description: t.meta.termsDescription };
}

export default function TermsPage() {
  const t = getDict();
  return (
    <SiteFrame>
      <PageHero kicker={t.product} title={t.nav.terms} lede={t.legal.updated} />
      <section className="section">
        <div className="wrap prose">
          {t.legal.terms.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>
    </SiteFrame>
  );
}

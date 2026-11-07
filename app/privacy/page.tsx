import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import SiteFrame from "@/components/SiteFrame";
import { getDict } from "@/lib/locale";

export function generateMetadata(): Metadata {
  const t = getDict();
  return { title: t.meta.privacyTitle, description: t.meta.privacyDescription };
}

export default function PrivacyPage() {
  const t = getDict();
  return (
    <SiteFrame>
      <PageHero kicker={t.product} title={t.nav.privacy} lede={t.legal.updated} />
      <section className="section">
        <div className="wrap prose">
          {t.legal.privacy.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>
    </SiteFrame>
  );
}

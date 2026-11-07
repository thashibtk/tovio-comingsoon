import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import SiteFrame from "@/components/SiteFrame";
import { getDict } from "@/lib/locale";

export function generateMetadata(): Metadata {
  const t = getDict();
  return { title: t.meta.howTitle, description: t.meta.howDescription };
}

export default function HowPage() {
  const t = getDict();
  return (
    <SiteFrame>
      <PageHero kicker={t.product} title={t.how.title} />
      <section className="section">
        <div className="wrap path-grid">
          <article className="path-card">
            <h2>{t.how.workerTitle}</h2>
            <ol className="plain-list">
              <li>{t.how.w1}</li>
              <li>{t.how.w2}</li>
              <li>{t.how.w3}</li>
              <li>{t.how.w4}</li>
            </ol>
          </article>
          <article className="path-card">
            <h2>{t.how.employerTitle}</h2>
            <ol className="plain-list">
              <li>{t.how.e1}</li>
              <li>{t.how.e2}</li>
              <li>{t.how.e3}</li>
              <li>{t.how.e4}</li>
            </ol>
          </article>
        </div>
      </section>
    </SiteFrame>
  );
}

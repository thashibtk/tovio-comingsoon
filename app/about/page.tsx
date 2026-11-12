import type { Metadata } from "next";
import Link from "next/link";
import SiteFrame from "@/components/SiteFrame";
import SiteIcon, { type SiteIconKind } from "@/components/SiteIcons";
import { getDict } from "@/lib/locale";

export function generateMetadata(): Metadata {
  const t = getDict();
  return { title: t.meta.aboutTitle, description: t.meta.aboutDescription };
}

export default function AboutPage() {
  const t = getDict();

  const points: { label: string; body: string; icon: SiteIconKind }[] = [
    { label: t.about.p1Label, body: t.about.p1, icon: "crew" },
    { label: t.about.p2Label, body: t.about.p2, icon: "search" },
    { label: t.about.p3Label, body: t.about.p3, icon: "brand" },
  ];

  return (
    <SiteFrame>
      <section className="setup-page story-page">
        <header className="setup-intro">
          <p className="section-label">{t.product}</p>
          <h1>{t.about.title}</h1>
          <p>{t.about.lead}</p>
        </header>

        <ul className="about-points">
          {points.map((point, index) => (
            <li key={point.label} className="about-point">
              <span className="about-point-icon" aria-hidden="true">
                <SiteIcon kind={point.icon} />
              </span>
              <div>
                <p className="about-point-kicker">0{index + 1} · {point.label}</p>
                <p>{point.body}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="about-actions">
          <Link className="btn btn-dark" href="/find">
            {t.nav.find}
          </Link>
          <Link className="btn btn-line-dark" href="/contact">
            {t.nav.contact}
          </Link>
        </div>
      </section>
    </SiteFrame>
  );
}

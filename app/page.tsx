import type { Metadata } from "next";
import Link from "next/link";
import SiteFrame from "@/components/SiteFrame";
import { getDict } from "@/lib/locale";

export function generateMetadata(): Metadata {
  const t = getDict();
  return { title: t.meta.homeTitle, description: t.meta.homeDescription };
}

export default function HomePage() {
  const t = getDict();

  return (
    <SiteFrame>
      <section className="hero hero-home" aria-labelledby="hero-title">
        <div className="grain" aria-hidden="true" />
        <div className="hero-content">
          <p className="eyebrow">{t.home.eyebrow}</p>
          <h1 id="hero-title">{t.home.title}</h1>
          <p className="intro">{t.home.intro}</p>
          <div className="hero-actions">
            <Link className="btn btn-gold" href="/find">
              {t.nav.find}
            </Link>
            <Link className="btn btn-line" href="/register">
              {t.nav.register}
            </Link>
          </div>
        </div>
      </section>

      <section className="section" aria-label={t.home.workerTitle}>
        <div className="wrap path-grid">
          <Link className="path-card" href="/register?role=worker">
            <p className="section-label">01</p>
            <h2>{t.home.workerTitle}</h2>
            <p>{t.home.workerBody}</p>
          </Link>
          <Link className="path-card" href="/register?role=employer">
            <p className="section-label">02</p>
            <h2>{t.home.employerTitle}</h2>
            <p>{t.home.employerBody}</p>
          </Link>
        </div>
      </section>

      <section className="section section-tint">
        <div className="wrap">
          <p className="section-label">03</p>
          <h2>{t.home.stepsTitle}</h2>
          <ol className="step-grid">
            <li>{t.home.s1}</li>
            <li>{t.home.s2}</li>
            <li>{t.home.s3}</li>
          </ol>
        </div>
      </section>

      <section className="section home-cover" aria-labelledby="cover-title">
        <div className="wrap">
          <p className="section-label">04</p>
          <h2 id="cover-title">{t.home.coverTitle}</h2>
          <p className="lede">{t.home.coverBody}</p>
          <ul className="home-promises">
            <li>
              <span className="home-promise-label">{t.home.cover1Label}</span>
              <p>{t.home.cover1Body}</p>
            </li>
            <li>
              <span className="home-promise-label">{t.home.cover2Label}</span>
              <p>{t.home.cover2Body}</p>
            </li>
            <li>
              <span className="home-promise-label">{t.home.cover3Label}</span>
              <p>{t.home.cover3Body}</p>
            </li>
          </ul>
          <div className="home-cover-actions">
            <Link className="btn btn-dark" href="/find">
              {t.nav.find}
            </Link>
            <Link className="btn btn-line-dark" href="/register">
              {t.nav.register}
            </Link>
          </div>
        </div>
      </section>
    </SiteFrame>
  );
}

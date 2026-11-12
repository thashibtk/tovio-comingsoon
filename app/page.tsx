import type { Metadata } from "next";
import Link from "next/link";
import SiteFrame from "@/components/SiteFrame";
import SiteIcon, { type SiteIconKind } from "@/components/SiteIcons";
import { getDict } from "@/lib/locale";

export function generateMetadata(): Metadata {
  const t = getDict();
  return { title: t.meta.homeTitle, description: t.meta.homeDescription };
}

export default function HomePage() {
  const t = getDict();

  const paths: {
    href: string;
    label: string;
    title: string;
    body: string;
    icon: SiteIconKind;
  }[] = [
    {
      href: "/register?role=worker",
      label: t.home.pathWorkerLabel,
      title: t.home.pathWorkerTitle,
      body: t.home.pathWorkerBody,
      icon: "worker",
    },
    {
      href: "/register?role=agent",
      label: t.home.pathAgentLabel,
      title: t.home.pathAgentTitle,
      body: t.home.pathAgentBody,
      icon: "agent",
    },
    {
      href: "/register?role=employer",
      label: t.home.pathEmployerLabel,
      title: t.home.pathEmployerTitle,
      body: t.home.pathEmployerBody,
      icon: "employer",
    },
  ];

  const steps: { label: string; body: string; icon: SiteIconKind }[] = [
    { label: t.home.s1Label, body: t.home.s1, icon: "signin" },
    { label: t.home.s2Label, body: t.home.s2, icon: "search" },
    { label: t.home.s3Label, body: t.home.s3, icon: "message" },
  ];

  const promises: { label: string; body: string; icon: SiteIconKind }[] = [
    { label: t.home.cover1Label, body: t.home.cover1Body, icon: "map" },
    { label: t.home.cover2Label, body: t.home.cover2Body, icon: "trades" },
    { label: t.home.cover3Label, body: t.home.cover3Body, icon: "phone" },
  ];

  return (
    <SiteFrame>
      <section className="hero hero-home" aria-labelledby="hero-title">
        <div className="grain" aria-hidden="true" />
        <div className="hero-content home-hero-rise">
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

      <section className="section home-paths" aria-labelledby="paths-title">
        <div className="wrap">
          <p className="section-label">01</p>
          <h2 id="paths-title">{t.home.pathsTitle}</h2>
          <p className="lede">{t.home.pathsBody}</p>
          <div className="home-path-grid">
            {paths.map((path) => (
              <Link key={path.href} className="home-path" href={path.href}>
                <span className="home-path-label">
                  <span className="home-path-icon" aria-hidden="true">
                    <SiteIcon kind={path.icon} />
                  </span>
                  {path.label}
                </span>
                <strong>{path.title}</strong>
                <p>{path.body}</p>
                <span className="home-path-action">{t.home.pathAction}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-tint home-steps" aria-labelledby="steps-title">
        <div className="wrap">
          <p className="section-label">02</p>
          <h2 id="steps-title">{t.home.stepsTitle}</h2>
          <p className="lede">{t.home.stepsBody}</p>
          <ol className="home-step-grid">
            {steps.map((step, index) => (
              <li key={step.label} className="home-step">
                <span className="home-step-top">
                  <span className="home-step-icon" aria-hidden="true">
                    <SiteIcon kind={step.icon} />
                  </span>
                  <span className="home-step-num">0{index + 1}</span>
                </span>
                <strong>{step.label}</strong>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section home-cover" aria-labelledby="cover-title">
        <div className="wrap">
          <p className="section-label">03</p>
          <h2 id="cover-title">{t.home.coverTitle}</h2>
          <p className="lede">{t.home.coverBody}</p>
          <ul className="home-promises">
            {promises.map((item) => (
              <li key={item.label}>
                <span className="home-promise-label">
                  <span className="home-promise-icon" aria-hidden="true">
                    <SiteIcon kind={item.icon} />
                  </span>
                  {item.label}
                </span>
                <p>{item.body}</p>
              </li>
            ))}
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

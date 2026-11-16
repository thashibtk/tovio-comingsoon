import type { Metadata } from "next";
import Link from "next/link";
import SiteFrame from "@/components/SiteFrame";
import SiteIcon, { type SiteIconKind } from "@/components/SiteIcons";
import { getDict } from "@/lib/locale";

export function generateMetadata(): Metadata {
  const t = getDict();
  return { title: t.meta.homeTitle, description: t.meta.homeDescription };
}

function Arrow() {
  return (
    <svg
      className="hc-arrow"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
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
      {/* Hero: one primary action, one quiet text link */}
      <section className="hero hero-home" aria-labelledby="hero-title">
        <div className="grain" aria-hidden="true" />
        <div className="hero-content home-hero-rise">
          <p className="eyebrow">{t.home.eyebrow}</p>
          <h1 id="hero-title">{t.home.title}</h1>
          <p className="intro">{t.home.intro}</p>
          <div className="hero-actions hc-hero-actions">
            <Link className="btn btn-gold" href="/find">
              {t.nav.find}
            </Link>
            <Link className="hc-textlink" href="/register">
              {t.nav.register}
              <Arrow />
            </Link>
          </div>
        </div>
      </section>

      {/* Paths: whole card is the link, no repeated button text */}
      <section className="section home-cards" aria-labelledby="paths-title">
        <div className="wrap">
          <header className="hc-head">
            <p className="section-label">01</p>
            <h2 id="paths-title">{t.home.pathsTitle}</h2>
            <p className="lede">{t.home.pathsBody}</p>
          </header>

          <div className="hc-grid hc-grid-3">
            {paths.map((path) => (
              <Link
                key={path.href}
                href={path.href}
                className="hc-card hc-card-link"
                aria-label={`${path.label}: ${path.title}`}
              >
                <span className="hc-icon" aria-hidden="true">
                  <SiteIcon kind={path.icon} />
                </span>
                <span className="hc-tag">{path.label}</span>
                <strong className="hc-title">{path.title}</strong>
                <p className="hc-body">{path.body}</p>
                <span className="hc-go" aria-hidden="true">
                  <Arrow />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Steps: numbered cards */}
      <section
        className="section section-tint home-cards"
        aria-labelledby="steps-title"
      >
        <div className="wrap">
          <header className="hc-head">
            <p className="section-label">02</p>
            <h2 id="steps-title">{t.home.stepsTitle}</h2>
            <p className="lede">{t.home.stepsBody}</p>
          </header>

          <ol className="hc-grid hc-grid-3 hc-steps">
            {steps.map((step, index) => (
              <li key={step.label} className="hc-card hc-step">
                <span className="hc-step-num" aria-hidden="true">
                  0{index + 1}
                </span>
                <span className="hc-icon" aria-hidden="true">
                  <SiteIcon kind={step.icon} />
                </span>
                <strong className="hc-title">{step.label}</strong>
                <p className="hc-body">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Coverage: info cards only, no buttons */}
      <section className="section home-cards" aria-labelledby="cover-title">
        <div className="wrap">
          <header className="hc-head">
            <p className="section-label">03</p>
            <h2 id="cover-title">{t.home.coverTitle}</h2>
            <p className="lede">{t.home.coverBody}</p>
          </header>

          <ul className="hc-grid hc-grid-3 hc-promises">
            {promises.map((item) => (
              <li key={item.label} className="hc-card hc-promise">
                <span className="hc-icon hc-icon-soft" aria-hidden="true">
                  <SiteIcon kind={item.icon} />
                </span>
                <strong className="hc-title">{item.label}</strong>
                <p className="hc-body">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </SiteFrame>
  );
}
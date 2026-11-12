import type { Metadata } from "next";
import Link from "next/link";
import SiteFrame from "@/components/SiteFrame";
import SiteIcon, { type SiteIconKind } from "@/components/SiteIcons";
import { getDict } from "@/lib/locale";

export function generateMetadata(): Metadata {
  const t = getDict();
  return { title: t.meta.howTitle, description: t.meta.howDescription };
}

export default function HowPage() {
  const t = getDict();

  const workerSteps: { text: string; icon: SiteIconKind }[] = [
    { text: t.how.w1, icon: "signin" },
    { text: t.how.w2, icon: "trades" },
    { text: t.how.w3, icon: "crew" },
    { text: t.how.w4, icon: "message" },
  ];

  const employerSteps: { text: string; icon: SiteIconKind }[] = [
    { text: t.how.e1, icon: "profile" },
    { text: t.how.e2, icon: "search" },
    { text: t.how.e3, icon: "phone" },
    { text: t.how.e4, icon: "message" },
  ];

  return (
    <SiteFrame>
      <section className="setup-page story-page">
        <header className="setup-intro">
          <p className="section-label">{t.product}</p>
          <h1>{t.how.title}</h1>
          <p>{t.how.lead}</p>
        </header>

        <div className="flow-grid">
          <article className="flow-panel">
            <header className="flow-panel-head">
              <span className="flow-panel-icon" aria-hidden="true">
                <SiteIcon kind="worker" />
              </span>
              <div>
                <p className="flow-kicker">01</p>
                <h2>{t.how.workerTitle}</h2>
                <p>{t.how.workerLead}</p>
              </div>
            </header>
            <ol className="flow-steps">
              {workerSteps.map((step, index) => (
                <li key={step.text}>
                  <span className="flow-step-icon" aria-hidden="true">
                    <SiteIcon kind={step.icon} />
                  </span>
                  <span className="flow-step-num">0{index + 1}</span>
                  <p>{step.text}</p>
                </li>
              ))}
            </ol>
            <Link className="btn btn-dark" href="/register?role=worker">
              {t.nav.register}
            </Link>
          </article>

          <article className="flow-panel">
            <header className="flow-panel-head">
              <span className="flow-panel-icon" aria-hidden="true">
                <SiteIcon kind="employer" />
              </span>
              <div>
                <p className="flow-kicker">02</p>
                <h2>{t.how.employerTitle}</h2>
                <p>{t.how.employerLead}</p>
              </div>
            </header>
            <ol className="flow-steps">
              {employerSteps.map((step, index) => (
                <li key={step.text}>
                  <span className="flow-step-icon" aria-hidden="true">
                    <SiteIcon kind={step.icon} />
                  </span>
                  <span className="flow-step-num">0{index + 1}</span>
                  <p>{step.text}</p>
                </li>
              ))}
            </ol>
            <Link className="btn btn-dark" href="/find">
              {t.nav.find}
            </Link>
          </article>
        </div>
      </section>
    </SiteFrame>
  );
}

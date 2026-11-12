"use client";

import { useState } from "react";
import EmployerForm from "./EmployerForm";
import WorkerForm from "./WorkerForm";
import { useI18n } from "@/lib/i18n";
import type { AccountType, Category, EmployerProfile, WorkerProfile, WorkerSkill } from "@/lib/types";

export default function OnboardingFlow({
  userId,
  email,
  accountType,
  hasProfile,
  categories,
  worker,
  skills,
  employer,
  roleHint,
  nextPath,
}: {
  userId: string;
  email: string;
  accountType: AccountType | null;
  hasProfile: boolean;
  categories: Category[];
  worker: WorkerProfile | null;
  skills: WorkerSkill[];
  employer: EmployerProfile | null;
  roleHint?: string | null;
  nextPath?: string | null;
}) {
  const { t } = useI18n();
  const hinted: AccountType =
    roleHint === "agent" || roleHint === "employer" || roleHint === "worker" ? roleHint : "worker";
  const [choice, setChoice] = useState<AccountType>(accountType ?? hinted);
  const [step, setStep] = useState<"choose" | "form">(hasProfile ? "form" : "choose");
  const type = hasProfile && accountType ? accountType : choice;

  if (!hasProfile && step === "choose") {
    const options: { id: AccountType; label: string; title: string; body: string; icon: "worker" | "agent" | "employer" }[] = [
      {
        id: "worker",
        label: t.onboarding.workerLabel,
        title: t.onboarding.worker,
        body: t.onboarding.workerBody,
        icon: "worker",
      },
      {
        id: "agent",
        label: t.onboarding.agentLabel,
        title: t.onboarding.agent,
        body: t.onboarding.agentBody,
        icon: "agent",
      },
      {
        id: "employer",
        label: t.onboarding.employerLabel,
        title: t.onboarding.employer,
        body: t.onboarding.employerBody,
        icon: "employer",
      },
    ];
    return (
      <div className="setup-choice-wrap">
        <div className="setup-choice">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              className={choice === option.id ? "role-card selected" : "role-card"}
              aria-pressed={choice === option.id}
              onClick={() => setChoice(option.id)}
            >
              <span className="role-kicker">
                <span className="role-icon" aria-hidden="true">
                  <RoleIcon kind={option.icon} />
                </span>
                {option.label}
              </span>
              <strong>{option.title}</strong>
              <span className="role-body">{option.body}</span>
            </button>
          ))}
        </div>
        <button className="btn btn-dark setup-continue" type="button" onClick={() => setStep("form")}>
          {t.onboarding.continue}
        </button>
      </div>
    );
  }

  const afterSave = nextPath || "/dashboard";

  return (
    <div className="setup-stage">
      {hasProfile ? null : (
        <button className="text-button" type="button" onClick={() => setStep("choose")}>
          {t.onboarding.change}
        </button>
      )}
      {type === "employer" ? (
        <EmployerForm userId={userId} authEmail={email} employer={employer} nextPath={afterSave} />
      ) : (
        <WorkerForm
          userId={userId}
          accountType={type === "agent" ? "agent" : "worker"}
          categories={categories}
          worker={worker}
          skills={skills}
          nextPath={afterSave}
          defaultEmail={email}
        />
      )}
    </div>
  );
}

function RoleIcon({ kind }: { kind: "worker" | "agent" | "employer" }) {
  if (kind === "worker") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 10V8.5A4 4 0 0 1 12 4.5 4 4 0 0 1 16 8.5V10" />
        <path d="M5 10h14v2.2c0 2.4-1.4 4.5-3.5 5.5L14 21h-4l-1.5-3.3C6.4 16.7 5 14.6 5 12.2V10z" />
        <path d="M9 14h6" />
      </svg>
    );
  }
  if (kind === "agent") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="8" r="2.5" />
        <circle cx="16" cy="9" r="2.2" />
        <path d="M3.5 18.5c.6-2.4 2.8-4 5.5-4s4.9 1.6 5.5 4" />
        <path d="M13.5 18.5c.4-1.5 1.5-2.7 3-3.2 1.5.4 2.7 1.5 3.2 3.2" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10.5" cy="10.5" r="5.5" />
      <path d="M15 15l5 5" />
    </svg>
  );
}

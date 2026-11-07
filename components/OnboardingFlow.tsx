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
    const options: { id: AccountType; title: string; body: string }[] = [
      { id: "worker", title: t.onboarding.worker, body: t.onboarding.workerBody },
      { id: "agent", title: t.onboarding.agent, body: t.onboarding.agentBody },
      { id: "employer", title: t.onboarding.employer, body: t.onboarding.employerBody },
    ];
    return (
      <div className="setup-choice-wrap">
        <div className="setup-choice">
          {options.map((option, index) => (
            <button
              key={option.id}
              type="button"
              className={choice === option.id ? "role-card selected" : "role-card"}
              aria-pressed={choice === option.id}
              onClick={() => setChoice(option.id)}
            >
              <span className="role-index">0{index + 1}</span>
              <strong>{option.title}</strong>
              <span>{option.body}</span>
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

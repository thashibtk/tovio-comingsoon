import type { Metadata } from "next";
import { Suspense } from "react";
import AuthForm from "@/components/AuthForm";
import SiteFrame from "@/components/SiteFrame";
import { getDict } from "@/lib/locale";

export function generateMetadata(): Metadata {
  const t = getDict();
  return { title: t.meta.registerTitle, description: t.auth.lead, robots: { index: false, follow: false } };
}

export default function RegisterPage() {
  const t = getDict();
  return (
    <SiteFrame>
      <section className="section">
        <div className="wrap narrow">
          <Suspense fallback={<p>{t.common.loading}</p>}>
            <AuthForm initialMode="signup" />
          </Suspense>
        </div>
      </section>
    </SiteFrame>
  );
}

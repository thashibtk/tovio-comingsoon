import type { Metadata } from "next";
import ForgotPasswordForm from "@/components/ForgotPasswordForm";
import SiteFrame from "@/components/SiteFrame";
import { getDict } from "@/lib/locale";

export function generateMetadata(): Metadata {
  const t = getDict();
  return { title: t.auth.forgotTitle, description: t.auth.forgotLead, robots: { index: false, follow: false } };
}

export default function ForgotPasswordPage() {
  return (
    <SiteFrame>
      <section className="section">
        <div className="wrap narrow">
          <ForgotPasswordForm />
        </div>
      </section>
    </SiteFrame>
  );
}

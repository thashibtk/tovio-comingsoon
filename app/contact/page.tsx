import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import SiteFrame from "@/components/SiteFrame";
import { getDict } from "@/lib/locale";

export function generateMetadata(): Metadata {
  const t = getDict();
  return { title: t.meta.contactTitle, description: t.meta.contactDescription };
}

export default function ContactPage() {
  const t = getDict();
  return (
    <SiteFrame>
      <section className="setup-page contact-page">
        <header className="setup-intro">
          <p className="section-label">{t.product}</p>
          <h1>{t.contact.title}</h1>
          <p>{t.contact.lead}</p>
        </header>
        <ContactForm />
      </section>
    </SiteFrame>
  );
}

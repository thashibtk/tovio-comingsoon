import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import PageHero from "@/components/PageHero";
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
      <PageHero kicker={t.product} title={t.contact.title} lede={t.contact.lead} />
      <section className="section">
        <div className="wrap narrow">
          <ContactForm />
        </div>
      </section>
    </SiteFrame>
  );
}

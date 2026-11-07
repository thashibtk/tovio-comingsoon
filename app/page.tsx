import type { Metadata } from "next";
import Link from "next/link";
import SiteFrame from "@/components/SiteFrame";
import { FALLBACK_CATEGORIES } from "@/lib/data";
import { getDict, getLang } from "@/lib/locale";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export function generateMetadata(): Metadata {
  const t = getDict();
  return { title: t.meta.homeTitle, description: t.meta.homeDescription };
}

export default async function HomePage() {
  const t = getDict();
  const lang = getLang();
  let categories: { name_en: string; name_hi: string }[] = FALLBACK_CATEGORIES.map((item) => ({
    name_en: item.en,
    name_hi: item.hi,
  }));

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    const { data } = await supabase
      .from("worker_categories")
      .select("name_en, name_hi")
      .eq("active", true)
      .order("sort_order");
    if (data?.length) categories = data;
  }

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

      <section className="section">
        <div className="wrap">
          <h2>{t.home.categoriesTitle}</h2>
          <p className="lede">{t.home.categoriesNote}</p>
          <ul className="category-cloud">
            {categories.map((category) => (
              <li key={category.name_en}>{lang === "hi" ? category.name_hi : category.name_en}</li>
            ))}
          </ul>
          <Link className="btn btn-dark" href="/find">
            {t.nav.find}
          </Link>
        </div>
      </section>
    </SiteFrame>
  );
}

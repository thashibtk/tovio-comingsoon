import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ContactReveal from "@/components/ContactReveal";
import SiteFrame from "@/components/SiteFrame";
import { districtName } from "@/lib/data";
import { availabilityLabel, formatDistricts, skillLabel, workLabel } from "@/lib/labels";
import { getDict, getLang } from "@/lib/locale";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { PublicSkill, PublicWorker } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const t = getDict();
  if (!isSupabaseConfigured()) return { title: t.meta.findTitle };
  const supabase = createClient();
  const { data } = await supabase.from("worker_public").select("name").eq("id", params.id).maybeSingle();
  return {
    title: data?.name || t.meta.findTitle,
    description: t.meta.findDescription,
  };
}

export default async function WorkerProfilePage({ params }: { params: { id: string } }) {
  const t = getDict();
  const lang = getLang();
  if (!isSupabaseConfigured()) notFound();

  const supabase = createClient();
  const [{ data: worker }, { data: skills }, { data: auth }] = await Promise.all([
    supabase.from("worker_public").select("*").eq("id", params.id).maybeSingle(),
    supabase.from("worker_skills_public").select("*").eq("profile_id", params.id),
    supabase.auth.getUser(),
  ]);

  if (!worker) notFound();
  const profile = worker as PublicWorker;
  const skillRows = (skills ?? []) as PublicSkill[];
  const available = skillRows.reduce((sum, skill) => sum + Number(skill.available_count || 0), 0);
  const place = `${districtName(profile.district, lang)}${profile.town ? `, ${profile.town}` : ""}`;
  const alsoWorks = (profile.preferred_districts ?? []).filter((id) => id !== profile.district);
  const signedIn = Boolean(auth.user);
  const role = profile.profile_type === "agent" ? t.account.agent : t.account.individual;

  return (
    <SiteFrame>
      <section className="section public-section">
        <div className="wrap public-profile">
          <header className="public-hero">
            {profile.photo_url ? (
              <img className="desk-avatar" src={profile.photo_url} alt="" />
            ) : (
              <span className="desk-fallback" aria-hidden="true">
                {profile.name.trim().slice(0, 1).toUpperCase() || "T"}
              </span>
            )}
            <div>
              <p className="desk-role">{role}</p>
              <h1>{profile.name}</h1>
              <p className="desk-meta">{place}</p>
              <div className="desk-pills">
                <span className={`pill pill-${profile.availability}`}>{availabilityLabel(t, profile.availability)}</span>
                {profile.work_type ? <span className="pill pill-viewed">{workLabel(t, profile.work_type)}</span> : null}
                {profile.profile_type === "agent" ? (
                  <span className="pill pill-accepted">
                    {t.profileView.available} {available}
                  </span>
                ) : null}
              </div>
            </div>
            <div className="public-actions">
              <ContactReveal workerId={profile.id} signedIn={signedIn} nextPath={`/workers/${profile.id}`} />
              <Link className="btn btn-dark" href={`/enquiry/${profile.id}`}>
                {t.find.send}
              </Link>
              <Link className="btn btn-line-dark" href="/find">
                {t.nav.find}
              </Link>
            </div>
          </header>

          <div className="public-layout">
            <div className="desk-panel">
              <h2>{t.profileView.skills}</h2>
              {skillRows.length ? (
                <ul className="tag-list">
                  {skillRows.map((skill) => (
                    <li key={skill.category_id}>
                      {lang === "hi" ? skill.name_hi : skill.name_en}
                      {skill.skill_level ? ` · ${skillLabel(t, skill.skill_level)}` : ""}
                      {profile.profile_type === "agent"
                        ? ` · ${t.profileView.available} ${skill.available_count}/${skill.total_count}`
                        : ""}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted">{t.find.empty}</p>
              )}
              {profile.description ? (
                <>
                  <h2>{t.profileView.about}</h2>
                  <p className="desk-note">{profile.description}</p>
                </>
              ) : null}
            </div>
            <aside className="desk-panel">
              <h2>{t.dashboard.snapshot}</h2>
              {profile.experience ? (
                <div className="fact-row">
                  <span>{t.profileView.experience}</span>
                  <strong>{profile.experience}</strong>
                </div>
              ) : null}
              {profile.available_from ? (
                <div className="fact-row">
                  <span>{t.profileView.availableFrom}</span>
                  <strong>{profile.available_from}</strong>
                </div>
              ) : null}
              {alsoWorks.length ? (
                <div className="fact-row">
                  <span>{t.profileView.preferred}</span>
                  <strong>{formatDistricts(alsoWorks, lang)}</strong>
                </div>
              ) : null}
              {profile.profile_type === "agent" ? (
                <div className="fact-row">
                  <span>{t.profileView.workforce}</span>
                  <strong>
                    {t.profileView.available} {available}
                  </strong>
                </div>
              ) : null}
            </aside>
          </div>
        </div>
      </section>
    </SiteFrame>
  );
}

"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ContactReveal from "@/components/ContactReveal";
import { DISTRICTS, townsForDistrict } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import { availabilityLabel, categoryName, groupedCategories, skillLabel } from "@/lib/labels";
import type { Category, PublicSkill, PublicWorker } from "@/lib/types";

type WorkerCard = PublicWorker & { skills: PublicSkill[] };

function isAbort(error: unknown) {
  return typeof error === "object" && error !== null && "name" in error && (error as { name: string }).name === "AbortError";
}

export default function FindWorkers({
  categories,
  enabled,
  signedIn,
}: {
  categories: Category[];
  enabled: boolean;
  signedIn: boolean;
}) {
  const { t, lang } = useI18n();
  const [district, setDistrict] = useState("");
  const [town, setTown] = useState("");
  const [category, setCategory] = useState("");
  const [profileType, setProfileType] = useState("");
  const [minimum, setMinimum] = useState("");
  const [workers, setWorkers] = useState<WorkerCard[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(enabled ? "loading" : "error");
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const offsetRef = useRef(0);
  const loadingMoreRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const towns = useMemo(() => townsForDistrict(district), [district]);
  const categoryGroups = useMemo(() => groupedCategories(categories, lang), [categories, lang]);

  const loadPage = useCallback(
    async (offset: number, signal?: AbortSignal) => {
      const params = new URLSearchParams();
      if (district) params.set("district", district);
      if (town) params.set("town", town);
      if (category) params.set("category", category);
      if (profileType) params.set("type", profileType);
      if (Number(minimum) > 0) params.set("min", String(Number(minimum)));
      params.set("offset", String(offset));
      const response = await fetch(`/api/workers?${params}`, { signal });
      if (!response.ok) throw new Error("load");
      return (await response.json()) as { workers: WorkerCard[]; hasMore: boolean; error?: boolean };
    },
    [category, district, minimum, profileType, town]
  );

  useEffect(() => {
    if (!enabled) {
      setStatus("error");
      setWorkers([]);
      return;
    }
    const controller = new AbortController();
    setStatus("loading");
    setWorkers([]);
    setHasMore(false);
    offsetRef.current = 0;
    loadPage(0, controller.signal)
      .then((page) => {
        if (page.error) throw new Error("load");
        setWorkers(page.workers);
        setHasMore(page.hasMore);
        offsetRef.current = page.workers.length;
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (isAbort(error)) return;
        setStatus("error");
      });
    return () => controller.abort();
  }, [enabled, loadPage]);

  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current || !hasMore || status !== "ready") return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const page = await loadPage(offsetRef.current);
      if (page.error) throw new Error("load");
      setWorkers((current) => [...current, ...page.workers]);
      setHasMore(page.hasMore);
      offsetRef.current += page.workers.length;
    } catch {
      setHasMore(false);
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [hasMore, loadPage, status]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore || status !== "ready") return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) void loadMore();
      },
      { rootMargin: "480px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadMore, status, workers.length]);

  function chooseDistrict(next: string) {
    setDistrict(next);
    setTown("");
  }

  const countLabel = `${workers.length}${hasMore ? "+" : ""} ${t.find.results}`;

  return (
    <div className="find-layout">
      <form className="find-filters" onSubmit={(event) => event.preventDefault()}>
        <label>
          <span>{t.find.district}</span>
          <select className="form-input" value={district} onChange={(event) => chooseDistrict(event.target.value)}>
            <option value="">{t.find.any}</option>
            {DISTRICTS.map((item) => (
              <option key={item.id} value={item.id}>
                {item[lang]}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>{t.find.town}</span>
          <select
            className="form-input"
            value={town}
            onChange={(event) => setTown(event.target.value)}
            disabled={!district}
          >
            <option value="">{district ? t.find.any : t.fields.townNeedDistrict}</option>
            {towns.map((item) => (
              <option key={item.en} value={item.en}>
                {item[lang]}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>{t.find.category}</span>
          <select className="form-input" value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">{t.find.any}</option>
            {categoryGroups.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {categoryName(item, lang)}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        <label>
          <span>{t.find.type}</span>
          <select className="form-input" value={profileType} onChange={(event) => setProfileType(event.target.value)}>
            <option value="">{t.find.any}</option>
            <option value="individual">{t.account.individual}</option>
            <option value="agent">{t.account.agent}</option>
          </select>
        </label>
        <label>
          <span>{t.find.minWorkers}</span>
          <input
            className="form-input"
            type="number"
            min={0}
            value={minimum}
            onChange={(event) => setMinimum(event.target.value)}
          />
          <small>{t.find.minHint}</small>
        </label>
      </form>

      <div className="find-results" aria-busy={status === "loading" || loadingMore}>
        {status === "error" ? <p className="modal-error">{t.find.error}</p> : null}
        {status === "loading" ? <p className="result-count">{t.find.loading}</p> : null}
        {status === "ready" ? <p className="result-count">{countLabel}</p> : null}
        {status === "ready" && workers.length === 0 ? <p className="empty-copy">{t.find.empty}</p> : null}
        <div className="find-grid">
          {status === "loading"
            ? Array.from({ length: 4 }, (_, index) => <div key={index} className="find-skeleton" />)
            : workers.map((worker) => {
                const place = DISTRICTS.find((item) => item.id === worker.district)?.[lang] ?? worker.district;
                const available = worker.skills.reduce((sum, skill) => sum + Number(skill.available_count || 0), 0);
                const shownSkills = worker.skills.slice(0, 4);
                return (
                  <article key={worker.id} className="person-card">
                    <div className="person-top">
                      {worker.photo_url ? (
                        <img src={worker.photo_url} alt="" />
                      ) : (
                        <span className="avatar-fallback" aria-hidden="true">
                          {worker.name.slice(0, 1)}
                        </span>
                      )}
                      <div className="person-main">
                        <p className="desk-role">
                          {worker.profile_type === "agent" ? t.account.agent : t.account.individual}
                        </p>
                        <h2>{worker.name}</h2>
                        <p>
                          {place}
                          {worker.town ? `, ${worker.town}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="desk-pills">
                      <span className={`pill pill-${worker.availability}`}>
                        {availabilityLabel(t, worker.availability)}
                      </span>
                      {worker.profile_type === "agent" ? (
                        <span className="pill pill-viewed">
                          {t.profileView.available} {available}
                        </span>
                      ) : null}
                    </div>
                    {shownSkills.length ? (
                      <ul className="tag-list">
                        {shownSkills.map((skill) => (
                          <li key={skill.category_id}>
                            {lang === "hi" ? skill.name_hi : skill.name_en}
                            {skill.skill_level ? ` · ${skillLabel(t, skill.skill_level)}` : ""}
                          </li>
                        ))}
                        {worker.skills.length > shownSkills.length ? <li>+{worker.skills.length - shownSkills.length}</li> : null}
                      </ul>
                    ) : null}
                    {worker.experience ? <p className="meta-line">{worker.experience}</p> : null}
                    <ContactReveal workerId={worker.id} signedIn={signedIn} nextPath="/find" />
                    <div className="card-actions">
                      <Link className="btn btn-line-dark" href={`/workers/${worker.id}`}>
                        {t.find.view}
                      </Link>
                      <Link className="btn btn-dark" href={`/enquiry/${worker.id}`}>
                        {t.find.send}
                      </Link>
                    </div>
                  </article>
                );
              })}
        </div>
        <div ref={sentinelRef} className="find-sentinel" />
        {loadingMore ? <p className="result-count">{t.find.more}</p> : null}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

const links = [
  { href: "/find", key: "find" },
  { href: "/how-it-works", key: "how" },
  { href: "/about", key: "about" },
  { href: "/contact", key: "contact" },
] as const;

export default function SiteHeader() {
  const { t, lang, setLang } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setSignedIn(Boolean(data.user)));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session?.user));
    });
    return () => data.subscription.unsubscribe();
  }, []);

  async function signOut() {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    await supabase.auth.signOut();
    setSignedIn(false);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link href="/" className="brand" aria-label="TOVIO home">
          TOVIO
        </Link>
        <button
          className="nav-toggle"
          type="button"
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((value) => !value)}
        >
          {t.nav.menu}
        </button>
        <nav id="site-nav" className={open ? "main-nav open" : "main-nav"}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname === link.href ? "nav-link active" : "nav-link"}
            >
              {t.nav[link.key]}
            </Link>
          ))}
          <div className="lang-switch" role="group" aria-label="Language">
            <button type="button" aria-pressed={lang === "en"} onClick={() => setLang("en")}>
              EN
            </button>
            <button type="button" aria-pressed={lang === "hi"} onClick={() => setLang("hi")}>
              हिं
            </button>
          </div>
          {signedIn ? (
            <>
              <Link className="nav-link" href="/dashboard">
                {t.nav.dashboard}
              </Link>
              <button className="btn btn-dark btn-small" type="button" onClick={signOut}>
                {t.nav.logout}
              </button>
            </>
          ) : (
            <>
              <Link className="nav-link" href="/login">
                {t.nav.login}
              </Link>
              <Link className="btn btn-dark btn-small" href="/register">
                {t.nav.register}
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

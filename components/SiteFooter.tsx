import Link from "next/link";
import { getDict } from "@/lib/locale";

export default function SiteFooter() {
  const t = getDict();
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-top">
          <h2>{t.home.ctaTitle}</h2>
          <p className="footer-line">
            {t.footer.line}
            <span className="translation">{t.product}</span>
          </p>
        </div>
        <div className="footer-links">
          <Link href="/find">{t.nav.find}</Link>
          <Link href="/how-it-works">{t.nav.how}</Link>
          <Link href="/about">{t.nav.about}</Link>
          <Link href="/contact">{t.nav.contact}</Link>
          <Link href="/privacy">{t.nav.privacy}</Link>
          <Link href="/terms">{t.nav.terms}</Link>
        </div>
        <div className="footer-bottom">
          <span className="brand">TOVIO</span>
          <span>
            © {year} TOVIO. {t.footer.rights}
          </span>
        </div>
      </div>
    </footer>
  );
}

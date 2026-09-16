import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found">
      <div className="grain" aria-hidden="true"></div>
      <div className="not-found-content">
        <p className="eyebrow">Lost / Kerala / Reimagined</p>
        <h1 className="error-code">404</h1>
        <h2>Page not found</h2>
        <p className="detail">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/" className="form-button">
          <span aria-hidden="true">→</span>RETURN HOME
        </Link>
      </div>
    </main>
  );
}
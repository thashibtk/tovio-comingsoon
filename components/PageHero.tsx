export default function PageHero({
  kicker,
  title,
  lede,
}: {
  kicker: string;
  title: string;
  lede?: string;
}) {
  return (
    <header className="page-hero">
      <p className="section-label">{kicker}</p>
      <h1>{title}</h1>
      {lede ? <p className="lede">{lede}</p> : null}
    </header>
  );
}

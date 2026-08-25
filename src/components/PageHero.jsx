export default function PageHero({ eyebrow, title, body, tone = 'light', aside }) {
  return (
    <section className={`page-hero page-hero--${tone}`}>
      <div className="container page-hero-grid">
        <div>
          <p className={`eyebrow ${tone === 'dark' ? 'eyebrow--light' : ''}`}>{eyebrow}</p>
          <h1>{title}</h1>
        </div>
        <div className="page-hero-copy">
          <p>{body}</p>
          {aside && <span>{aside}</span>}
        </div>
      </div>
    </section>
  );
}

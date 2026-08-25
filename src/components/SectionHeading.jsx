// Made by loxqcx on Discord.
export default function SectionHeading({ eyebrow, title, body, inverse = false }) {
  return (
    <div className={`section-heading ${inverse ? 'section-heading--inverse' : ''}`}>
      <p className={`eyebrow ${inverse ? 'eyebrow--light' : ''}`}>{eyebrow}</p>
      <div>
        <h2>{title}</h2>
        {body && <p>{body}</p>}
      </div>
    </div>
  );
}

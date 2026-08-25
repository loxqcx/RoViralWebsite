// Made by loxqcx on Discord.
export default function GraphicPanel({ item, large = false }) {
  return (
    <div
      className={`graphic-panel graphic-panel--${item.motif} ${large ? 'graphic-panel--large' : ''}`}
      style={{ '--c1': item.palette[0], '--c2': item.palette[1], '--c3': item.palette[2] }}
      aria-hidden="true"
    >
      <div className="graphic-grid" />
      <span className="graphic-orbit graphic-orbit--one" />
      <span className="graphic-orbit graphic-orbit--two" />
      <span className="graphic-cube graphic-cube--one" />
      <span className="graphic-cube graphic-cube--two" />
      <span className="graphic-cube graphic-cube--three" />
      <strong>{item.title.split(' ')[0]}</strong>
      <small>{item.category}</small>
    </div>
  );
}

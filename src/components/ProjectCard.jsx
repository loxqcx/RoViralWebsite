// Made by loxqcx on Discord.
export default function ProjectCard({ item, index }) {
  return (
    <article className={`project-card project-card--${index % 2 ? 'offset' : 'standard'}`}>
      <div className="selected-work-media">
        <img
          src={item.thumbnail}
          alt={`${item.name} project thumbnail`}
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = '/assets/hero-thumbnail.png';
          }}
        />
        <span>{item.label}</span>
      </div>
      <div className="project-meta">
        <h3>{item.name}</h3>
        <strong>{item.stat}</strong>
      </div>
    </article>
  );
}

// Made by loxqcx on Discord.
import { ArrowUpRight } from 'lucide-react';
import GraphicPanel from './GraphicPanel';

export default function ProjectCard({ item, index }) {
  return (
    <article className={`project-card project-card--${index % 2 ? 'offset' : 'standard'}`}>
      <GraphicPanel item={item} />
      <div className="project-meta">
        <div>
          <span>{item.category} / {item.year}</span>
          <h3>{item.title}</h3>
        </div>
        <div className="project-result">
          <strong>{item.result}</strong>
          <ArrowUpRight size={22} />
        </div>
      </div>
      <p>{item.description}</p>
    </article>
  );
}

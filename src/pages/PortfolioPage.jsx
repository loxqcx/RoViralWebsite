import PageHero from '../components/PageHero';
import ProjectCard from '../components/ProjectCard';
import { siteConfig } from '../config/site';

export default function PortfolioPage() {
  return (
    <>
      <PageHero tone="dark" eyebrow="Selected work / 2025-26" title={<>Growth you can<br />actually feel.</>} body="A selection of launch systems, content worlds, and discovery improvements built for games with something real to say." />
      <section className="portfolio-page section-pad">
        <div className="container project-grid project-grid--all">
          {siteConfig.portfolio.map((item, index) => <ProjectCard key={item.slug} item={item} index={index} />)}
        </div>
      </section>
    </>
  );
}

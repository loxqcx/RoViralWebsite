import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import { siteConfig } from '../config/site';

export default function AboutPage() {
  return (
    <>
      <PageHero eyebrow="About RoViral" title={<>Good games deserve<br />better attention.</>} body="RoViral exists because the best part of a game rarely survives the trip into a generic marketing plan. We build growth around the actual experience." />
      <section className="manifesto section-pad">
        <div className="container manifesto-grid">
          <p className="eyebrow">Our point of view</p>
          <div>
            <h2>Marketing should feel like an extension of the game, not an interruption.</h2>
            <p>That means finding the game’s clearest promise, packaging it in platform-native creative, and giving the community a reason to participate. No disconnected content calendar. No vague “awareness.” Just a useful system that learns every week.</p>
          </div>
        </div>
        <div className="container values-grid">
          <article><span>01</span><h3>Specific beats loud</h3><p>The sharper the promise, the easier it is for players and creators to carry it forward.</p></article>
          <article><span>02</span><h3>Ship to learn</h3><p>We move quickly enough to let real audience behavior improve the next creative round.</p></article>
          <article><span>03</span><h3>Community is product</h3><p>Player conversation is not a support queue. It is a growth channel and a design signal.</p></article>
          <article><span>04</span><h3>Own the outcome</h3><p>We care about the metric after the deliverable, not just whether the file was sent.</p></article>
        </div>
      </section>
      <section className="about-team-cta">
        <div className="container"><h2>Meet the people<br />behind the work.</h2><Link className="button button--lime" to="/team">Our team <ArrowUpRight size={18} /></Link></div>
      </section>
    </>
  );
}

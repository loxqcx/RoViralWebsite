// Made by loxqcx on Discord.
import { useMemo, useState } from 'react';
import { ArrowUpRight, CheckCircle2, LoaderCircle, Star, X } from 'lucide-react';
import { reviewsConfig } from '../config/reviews';
import useReviews from '../hooks/useReviews';
import SectionHeading from './SectionHeading';

const emptyForm = { discord: '', name: '', message: '', stars: '5', website: '' };

function ReviewAvatar({ review }) {
  const [failed, setFailed] = useState(false);
  if (review.avatarUrl && !failed) {
    return <img src={review.avatarUrl} alt="" onError={() => setFailed(true)} />;
  }
  return <span aria-hidden="true">{(review.displayName || review.username || '?').slice(0, 1).toUpperCase()}</span>;
}

function ReviewCard({ review }) {
  return (
    <article className="review-card">
      <header>
        <div className="review-avatar"><ReviewAvatar review={review} /></div>
        <div>
          <h3>{review.displayName || review.username}</h3>
          <p>@{review.username}</p>
        </div>
      </header>
      <blockquote>{review.message}</blockquote>
      <div className="review-rating" aria-label={`${review.stars} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} size={17} fill={star <= review.stars ? 'currentColor' : 'none'} aria-hidden="true" />
        ))}
        <span>{review.stars}/5</span>
      </div>
    </article>
  );
}

function ReviewForm({ onClose }) {
  const copy = reviewsConfig.form;
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setStatus('loading');
    setError('');
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'The review could not be sent.');
      setStatus('success');
      setForm(emptyForm);
    } catch (reviewError) {
      setStatus('error');
      setError(reviewError.message);
    }
  };

  if (status === 'success') {
    return (
      <div className="review-form review-success" role="status">
        <CheckCircle2 size={38} />
        <h3>{copy.successTitle}</h3>
        <p>{copy.successBody}</p>
        <div className="button-row">
          <button className="button button--lime" type="button" onClick={() => setStatus('idle')}>{copy.resetLabel}</button>
          <button className="text-link" type="button" onClick={onClose}>{copy.closeLabel}</button>
        </div>
      </div>
    );
  }

  return (
    <form className="review-form" onSubmit={submit}>
      <div className="review-form-heading">
        <h3>{copy.title}</h3>
        <button className="icon-button" type="button" onClick={onClose} aria-label={copy.closeLabel}><X size={19} /></button>
      </div>
      <div className="review-form-grid">
        <label>{copy.discordLabel}<input required name="discord" value={form.discord} onChange={update} placeholder={copy.discordPlaceholder} maxLength={40} /></label>
        <label>{copy.nameLabel}<input name="name" value={form.name} onChange={update} placeholder={copy.namePlaceholder} maxLength={50} /></label>
        <label className="review-message-field">{copy.messageLabel}<textarea required name="message" value={form.message} onChange={update} placeholder={copy.messagePlaceholder} rows="5" minLength={10} maxLength={700} /></label>
        <label>{copy.starsLabel}<input required type="number" name="stars" value={form.stars} onChange={update} min="1" max="5" step="1" inputMode="numeric" /></label>
      </div>
      <label className="honeypot" aria-hidden="true">Website<input name="website" tabIndex="-1" autoComplete="off" value={form.website} onChange={update} /></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button button--lime" type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? <><LoaderCircle className="spin" size={18} /> {copy.loadingLabel}</> : <>{copy.submitLabel}<ArrowUpRight size={18} /></>}
      </button>
    </form>
  );
}

export default function ReviewsSection() {
  const { reviews, status } = useReviews();
  const [formOpen, setFormOpen] = useState(false);
  const railReviews = useMemo(() => {
    if (!reviews.length) return [];
    return Array.from({ length: Math.max(1, Math.ceil(4 / reviews.length)) }, () => reviews).flat();
  }, [reviews]);

  return (
    <section className="reviews-section section-pad" id={reviewsConfig.sectionId}>
      <div className="container">
        <SectionHeading eyebrow={reviewsConfig.eyebrow} title={reviewsConfig.title} body={reviewsConfig.body} inverse />
      </div>
      {railReviews.length ? (
        <div className="reviews-marquee" style={{ '--review-duration': `${reviewsConfig.marqueeDurationSeconds}s` }}>
          <div className="reviews-track">
            {[0, 1].map((group) => (
              <div className="reviews-group" aria-hidden={group === 1} key={group}>
                {railReviews.map((review, index) => <ReviewCard review={review} key={`${group}-${review.id}-${index}`} />)}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="container"><p className="reviews-empty">{status === 'loading' ? 'Loading reviews...' : reviewsConfig.emptyMessage}</p></div>
      )}
      <div className="container review-action">
        {!formOpen && <button className="button button--lime" type="button" onClick={() => setFormOpen(true)}>{reviewsConfig.form.openLabel}<ArrowUpRight size={18} /></button>}
        {formOpen && <ReviewForm onClose={() => setFormOpen(false)} />}
      </div>
    </section>
  );
}

// Made by loxqcx on Discord.
import { useMemo, useState } from 'react';
import { ArrowUpRight, CheckCircle2, LoaderCircle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { brandConfig } from '../config/brand';
import { contactPageConfig } from '../config/contact';

const emptyForm = {
  name: '', email: '', company: '', gameLink: '', discord: '', service: '', budget: '', message: '', website: '',
};

export default function ContactPage() {
  const [searchParams] = useSearchParams();
  const packageName = searchParams.get('package');
  const initialMessage = useMemo(() => packageName ? `I'm interested in the ${packageName} package. ` : '', [packageName]);
  const [form, setForm] = useState({ ...emptyForm, message: initialMessage });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setStatus('loading');
    setError('');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'We could not send your inquiry.');
      setStatus('success');
      setForm({ ...emptyForm });
    } catch (err) {
      setStatus('error');
      setError(err.message);
    }
  };

  return (
    <section className="contact-page">
      <div className="container contact-grid">
        <div className="contact-intro">
          <p className="eyebrow eyebrow--light">{contactPageConfig.eyebrow}</p>
          <h1>{contactPageConfig.heading}</h1>
          <p>{contactPageConfig.subheading}</p>
          <div className="contact-direct">
            <span>{contactPageConfig.discordPrompt}</span>
            <a href={brandConfig.discordUrl} target="_blank" rel="noreferrer">{contactPageConfig.discordLabel} <ArrowUpRight size={17} /></a>
          </div>
        </div>
        <div className="contact-form-wrap">
          {status === 'success' ? (
            <div className="form-success">
              <CheckCircle2 size={42} />
              <h2>{contactPageConfig.success.title}</h2>
              <p>{contactPageConfig.success.body}</p>
              <button className="button button--dark" onClick={() => setStatus('idle')}>{contactPageConfig.success.resetLabel}</button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={submit}>
              <div className="form-row">
                <label>Name<input required name="name" autoComplete="name" value={form.name} onChange={update} placeholder="Your name" maxLength={80} /></label>
                <label>Email<input required type="email" name="email" autoComplete="email" value={form.email} onChange={update} placeholder="you@studio.com" maxLength={120} /></label>
              </div>
              <div className="form-row">
                <label>Studio / company<input name="company" autoComplete="organization" value={form.company} onChange={update} placeholder="Studio name" maxLength={100} /></label>
                <label>Discord username<input name="discord" value={form.discord} onChange={update} placeholder="username" maxLength={80} /></label>
              </div>
              <label>Game link<input type="url" name="gameLink" value={form.gameLink} onChange={update} placeholder="https://www.roblox.com/games/..." maxLength={300} /></label>
              <div className="form-row">
                <label>Primary service<select required name="service" value={form.service} onChange={update}><option value="" disabled>Select a service</option>{contactPageConfig.serviceOptions.map((option) => <option key={option}>{option}</option>)}</select></label>
                <label>Estimated budget<select required name="budget" value={form.budget} onChange={update}><option value="" disabled>Select a range</option>{contactPageConfig.budgetOptions.map((option) => <option key={option}>{option}</option>)}</select></label>
              </div>
              <label>Tell us about the game<textarea required name="message" value={form.message} onChange={update} placeholder="What are you building, where is it now, and what would a great result look like?" rows="6" minLength={20} maxLength={2000} /></label>
              <label className="honeypot" aria-hidden="true">Website<input name="website" tabIndex="-1" autoComplete="off" value={form.website} onChange={update} /></label>
              {error && <p className="form-error" role="alert">{error}</p>}
              <button className="button button--dark submit-button" type="submit" disabled={status === 'loading'}>
                {status === 'loading' ? <><LoaderCircle className="spin" size={18} /> {contactPageConfig.loadingLabel}</> : <>{contactPageConfig.submitLabel} <ArrowUpRight size={18} /></>}
              </button>
              <small>{contactPageConfig.consent}</small>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

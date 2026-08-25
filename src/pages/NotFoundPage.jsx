// Made by loxqcx on Discord.
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { notFoundPageConfig } from '../config/notFound';

export default function NotFoundPage() {
  return <section className="not-found"><span>{notFoundPageConfig.code}</span><h1>{notFoundPageConfig.heading}</h1><Link className="button button--lime" to="/"><ArrowLeft size={18} /> {notFoundPageConfig.buttonLabel}</Link></section>;
}

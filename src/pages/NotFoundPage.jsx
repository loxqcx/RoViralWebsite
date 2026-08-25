import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return <section className="not-found"><span>404</span><h1>This page missed the feed.</h1><Link className="button button--lime" to="/"><ArrowLeft size={18} /> Back home</Link></section>;
}

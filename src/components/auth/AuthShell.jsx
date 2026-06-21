import { Link } from "react-router-dom";
import Seo from "@/components/seo/Seo";

/**
 * Centered glass card used by all auth pages. `seoTitle`/`seoDescription` drive per-page SEO;
 * auth pages are marked noindex (private utility pages).
 */
export default function AuthShell({ title, subtitle, seoTitle, seoDescription, children, footer }) {
  return (
    <main className="flex min-h-[calc(100vh-6rem)] items-center justify-center px-4 py-24">
      <Seo title={seoTitle || title} description={seoDescription} noindex />
      <div className="glass-strong w-full max-w-md rounded-3xl p-8 shadow-card">
        <Link to="/" className="mb-6 inline-flex items-center gap-2">
          <span className="font-display text-xl font-bold tracking-tight text-app-text">
            Inner<span className="text-gradient">Style</span>
          </span>
        </Link>
        <h1 className="font-display text-2xl font-bold text-app-text">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-app-muted">{subtitle}</p>}
        <div className="mt-7">{children}</div>
        {footer && <div className="mt-6 text-center text-sm text-app-muted">{footer}</div>}
      </div>
    </main>
  );
}

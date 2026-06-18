import { Link } from "react-router-dom";
import { Github, Twitter, BookOpen } from "lucide-react";
import { useT } from "@/hooks/useI18n";

export default function Footer() {
  const t = useT();

  const cols = [
    {
      title: t("footer.product"),
      links: [
        { label: t("footer.studio"), to: "/studio" },
        { label: t("footer.how"), to: "/#how" },
        { label: t("footer.features"), to: "/#features" },
      ],
    },
    {
      title: t("footer.pipeline"),
      links: [
        { label: t("footer.imageTo3d"), to: "/studio" },
        { label: t("footer.textTo3d"), to: "/studio" },
        { label: t("footer.rigAnimate"), to: "/studio" },
      ],
    },
    {
      title: t("footer.resources"),
      links: [
        { label: t("footer.docs"), to: "/#" },
        { label: t("footer.api"), to: "/#" },
        { label: t("footer.support"), to: "/#" },
      ],
    },
  ];

  return (
    <footer className="relative mt-32 border-t border-app-line/10">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#7c5cff,#22d3ee)] shadow-glow">
                <svg viewBox="0 0 64 64" className="h-5 w-5" fill="none" stroke="white" strokeWidth="3" strokeLinejoin="round">
                  <path d="M32 12 L50 22 L50 42 L32 52 L14 42 L14 22 Z" />
                </svg>
              </span>
              <span className="font-display text-lg font-bold text-app-text">
                Inner<span className="text-gradient">Style</span>
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-app-muted">
              {t("footer.tagline")}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {cols.map((col) => (
              <FooterCol key={col.title} title={col.title} links={col.links} />
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-app-line/10 pt-6 sm:flex-row">
          <p className="text-xs text-app-faint">
            {t("footer.rights", { year: new Date().getFullYear() })}
          </p>
          <div className="flex items-center gap-2">
            {[Github, Twitter, BookOpen].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="rounded-lg p-2 text-app-muted transition-colors hover:bg-app-line/5 hover:text-app-text"
                aria-label="social link"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-app-faint">
        {title}
      </h4>
      <ul className="mt-4 space-y-2.5">
        {links.map((l, i) => (
          <li key={i}>
            <Link
              to={l.to}
              className="text-sm text-app-muted transition-colors hover:text-app-text"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

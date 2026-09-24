import { Link } from "react-router-dom";
import { Mail, LifeBuoy, MessageCircle } from "lucide-react";
import { useT } from "@/hooks/useI18n";
import { useTheme } from "@/hooks/useTheme";
import { Facebook, Instagram, TikTok, YouTube } from "@/components/layout/SocialIcons";

// Shared by the footer and the Support page — replace with the real handles/inbox.
export const CONTACT_EMAIL = "innerstyle.contact@gmail.com";
export const MESHY_DOCS_URL = "https://docs.meshy.ai/en";
export const MESHY_API_URL = "https://docs.meshy.ai/en/api";

const socials = [
  { label: "Facebook", icon: Facebook, href: "https://www.facebook.com/share/1QSWqkXfeu/?mibextid=wwXIfr" },
  { label: "Instagram", icon: Instagram, href: "https://www.instagram.com/" },
  { label: "TikTok", icon: TikTok, href: "https://www.tiktok.com/" },
  { label: "YouTube", icon: YouTube, href: "https://www.youtube.com/" },
];

export default function Footer() {
  const t = useT();
  const { theme } = useTheme();

  // `href` = plain anchor (in-page #hash or external); `to` = SPA route. React Router's <Link>
  // doesn't scroll to a #hash, which is why "How it works" / "Features" did nothing before.
  const cols = [
    {
      title: t("footer.product"),
      links: [
        { label: t("footer.studio"), to: "/studio" },
        { label: t("footer.how"), href: "/#how" },
        { label: t("footer.features"), href: "/#features" },
      ],
    },
    {
      title: t("footer.pipeline"),
      links: [
        { label: t("footer.imageTo3d"), to: "/studio" },
        { label: t("footer.textTo3d"), to: "/studio" }
      ],
    },
    {
      title: t("footer.resources"),
      links: [
        { label: t("footer.docs"), href: MESHY_DOCS_URL, external: true },
        { label: t("footer.api"), href: MESHY_API_URL, external: true },
      ],
    },
    {
      title: t("footer.contact"),
      links: [
        { label: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}`, icon: Mail },
        { label: t("footer.helpCenter"), to: "/support", icon: LifeBuoy }
      ],
    },
  ];

  return (
    <footer className="relative mt-32 border-t border-app-line/10">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-sm">
            <Link to="/" className="flex items-center">
              <img
                src={
                  theme === "dark"
                    ? "/innerstyle_logo_breakthrough_dark.svg"
                    : "/innerstyle_logo_light.svg"
                }
                alt="InnerStyle"
                className="h-14 w-auto select-none sm:h-16"
                draggable={false}
              />
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-app-muted">
              {t("footer.tagline")}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
            {cols.map((col) => (
              <FooterCol key={col.title} title={col.title} links={col.links} />
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-app-line/10 pt-6 sm:flex-row">
          <p className="text-xs text-app-faint">
            {t("footer.rights", { year: new Date().getFullYear() })}
          </p>
          <ul className="flex items-center gap-5">
            {socials.map(({ label, icon: Icon, href }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex text-app-muted transition-colors hover:text-app-text"
                >
                  <Icon size={18} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }) {
  const cls =
    "inline-flex items-center gap-2 text-sm text-app-muted transition-colors hover:text-app-text";
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-app-faint">
        {title}
      </h4>
      <ul className="mt-4 space-y-2.5">
        {links.map(({ label, to, href, external, icon: Icon }) => {
          const body = (
            <>
              {Icon && <Icon className="h-4 w-4 shrink-0" />}
              <span className="break-all">{label}</span>
            </>
          );
          return (
            <li key={label}>
              {to ? (
                <Link to={to} className={cls}>{body}</Link>
              ) : (
                <a
                  href={href}
                  className={cls}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  {body}
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

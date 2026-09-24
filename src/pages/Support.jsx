import { Link } from "react-router-dom";
import { Mail, BookOpen, Code2, ChevronDown } from "lucide-react";
import Seo from "@/components/seo/Seo";
import { useT } from "@/hooks/useI18n";
import { CONTACT_EMAIL, MESHY_DOCS_URL, MESHY_API_URL } from "@/components/layout/Footer";

const FAQ_COUNT = 8;

/** Help center: FAQ + how to reach us. Content lives in the `support.*` locale keys. */
export default function Support() {
  const t = useT();
  const cards = [
    { icon: Mail, title: t("support.emailTitle"), body: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
    { icon: BookOpen, title: t("footer.docs"), body: t("support.docsBody"), href: MESHY_DOCS_URL, external: true },
    { icon: Code2, title: t("footer.api"), body: t("support.apiBody"), href: MESHY_API_URL, external: true },
  ];

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 pb-24 pt-28">
      <Seo title="Support" description={t("support.subtitle")} />
      <h1 className="font-display text-3xl font-bold text-app-text">{t("support.title")}</h1>
      <p className="mt-2 text-app-muted">{t("support.subtitle")}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {cards.map(({ icon: Icon, title, body, href, external }) => (
          <a
            key={title}
            href={href}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="glass-strong rounded-2xl p-5 transition-colors hover:bg-app-line/5"
          >
            <Icon className="h-5 w-5 text-brand-violet" />
            <p className="mt-3 font-medium text-app-text">{title}</p>
            <p className="mt-1 break-all text-sm text-app-muted">{body}</p>
          </a>
        ))}
      </div>

      <h2 className="mt-12 text-xl font-semibold text-app-text">{t("support.faqTitle")}</h2>
      <div className="mt-4 space-y-3">
        {Array.from({ length: FAQ_COUNT }, (_, i) => i + 1).map((n) => (
          <details
            key={n}
            className="group rounded-2xl border border-app-line/10 bg-app-line/[0.03] p-4"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-app-text">
              {t(`support.q${n}`)}
              <ChevronDown className="h-4 w-4 shrink-0 text-app-muted transition-transform group-open:rotate-180" />
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-app-muted">{t(`support.a${n}`)}</p>
          </details>
        ))}
      </div>

      <p className="mt-10 text-sm text-app-muted">
        {t("support.stillStuck")}{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-brand-violet underline">
          {CONTACT_EMAIL}
        </a>
        {" · "}
        <Link to="/print-history" className="text-brand-violet underline">
          {t("support.printHistoryLink")}
        </Link>
      </p>
    </main>
  );
}

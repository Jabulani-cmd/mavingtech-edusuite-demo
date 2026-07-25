import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import { SUPPORTED_LANGUAGES, type LangCode } from "@/i18n";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  /** Compact hides the globe icon and shrinks paddings. */
  compact?: boolean;
}

/**
 * Clear EN | ZU pill switch with a globe icon. The active language is
 * highlighted; clicking the other option changes the language instantly
 * across the whole app (react-i18next re-renders every consumer).
 */
export default function LanguageToggle({ className, compact = false }: Props) {
  const { i18n, t } = useTranslation();
  const current: LangCode =
    (SUPPORTED_LANGUAGES.find((l) => i18n.resolvedLanguage?.startsWith(l.code))?.code as LangCode) ??
    "en";

  const change = (code: LangCode) => {
    if (code === current) return;
    i18n.changeLanguage(code);
    try {
      localStorage.setItem("mavingtech.lang", code);
    } catch {}
  };

  return (
    <div
      role="group"
      aria-label={t("common.language")}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-background/95 shadow-sm",
        compact ? "px-1.5 py-0.5" : "px-2 py-1",
        className,
      )}
    >
      {!compact && (
        <Globe className="ml-1 h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
      )}
      <div className="flex items-center rounded-full bg-muted/60 p-0.5" role="tablist">
        {SUPPORTED_LANGUAGES.map((l) => {
          const active = l.code === current;
          return (
            <button
              key={l.code}
              type="button"
              role="tab"
              aria-selected={active}
              aria-label={l.label}
              title={l.label}
              onClick={() => change(l.code as LangCode)}
              className={cn(
                "min-w-[2.25rem] rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide transition-colors",
                active
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-foreground/70 hover:text-foreground",
              )}
            >
              {l.short}
            </button>
          );
        })}
      </div>
    </div>
  );
}

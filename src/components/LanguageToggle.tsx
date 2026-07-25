import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SUPPORTED_LANGUAGES } from "@/i18n";

interface Props {
  variant?: "default" | "compact";
  className?: string;
}

export default function LanguageToggle({ variant = "default", className }: Props) {
  const { i18n, t } = useTranslation();
  const current = SUPPORTED_LANGUAGES.find((l) => i18n.resolvedLanguage?.startsWith(l.code)) ?? SUPPORTED_LANGUAGES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={variant === "compact" ? "icon" : "sm"}
          className={className}
          aria-label={t("common.language")}
        >
          <Languages className="h-4 w-4" />
          {variant === "default" && (
            <span className="ml-1 text-xs font-semibold tracking-wide">{current.short}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[8rem]">
        {SUPPORTED_LANGUAGES.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onSelect={() => {
              i18n.changeLanguage(l.code);
              try {
                localStorage.setItem("mavingtech.lang", l.code);
              } catch {}
            }}
            className={l.code === current.code ? "font-semibold text-primary" : ""}
          >
            <span className="mr-2 text-xs font-mono opacity-70">{l.short}</span>
            {l.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

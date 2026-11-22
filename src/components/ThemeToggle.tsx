import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", key: "common.themeLight", fallback: "Light", Icon: Sun },
  { value: "dark", key: "common.themeDark", fallback: "Dark", Icon: Moon },
  { value: "system", key: "common.themeSystem", fallback: "System", Icon: Monitor },
] as const;

/**
 * Light, dark or follow-the-device. The choice is remembered on this device
 * (next-themes writes it to localStorage and sets the `dark` class before first paint).
 */
export default function ThemeToggle({ className }: { className?: string }) {
  const { t } = useTranslation();
  const { theme = "system", resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const shown = mounted ? resolvedTheme : "light";
  const TriggerIcon = shown === "dark" ? Moon : Sun;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        aria-label={t("common.theme", "Theme")}
        className={cn(
          "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md sm:h-9 sm:w-9 border border-border bg-background text-foreground shadow-sm transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className,
        )}
      >
        <TriggerIcon className="h-4 w-4" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-[60] min-w-[9rem]">
        {OPTIONS.map(({ value, key, fallback, Icon }) => (
          <DropdownMenuItem
            key={value}
            onSelect={() => setTheme(value)}
            className="flex items-center justify-between gap-3"
            aria-current={mounted && theme === value ? "true" : undefined}
          >
            <span className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              {t(key, fallback)}
            </span>
            {mounted && theme === value && <Check className="h-4 w-4 text-primary" aria-hidden="true" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

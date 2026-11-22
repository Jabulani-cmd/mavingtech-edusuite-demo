import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export default function Downloads() {
  const { t } = useTranslation();
  const [downloads, setDownloads] = useState<Tables<"downloads">[]>([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("downloads").select("*").order("created_at", { ascending: false });
      if (data) setDownloads(data);
    };
    fetch();
  }, []);

  const categoryLabel = (c: string) => c === "all" ? t("common.all") : t(`downloads.categories.${c}`, { defaultValue: c });
  const filtered = filter === "all" ? downloads : downloads.filter(d => d.category === filter);
  const categories = ["all", ...Array.from(new Set(downloads.map(d => d.category)))];

  return (
    <Layout>
      <section className="bg-navy py-14 md:py-16">
        <div className="container">
          <h1 className="font-heading text-4xl font-extrabold text-lit md:text-6xl">
            {t("downloads.title")}
          </h1>
        </div>
      </section>
      <div className="chevron-band chevron-band-lg" aria-hidden="true" />

      <section className="py-16">
        <div className="container">
          <div className="mb-8 flex flex-wrap gap-2">
            {categories.map(c => (
              <Button key={c} variant={filter === c ? "default" : "outline"} size="sm" onClick={() => setFilter(c)}>
                {categoryLabel(c)}
              </Button>
            ))}
          </div>

          {filtered.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((d, i) => (
                <div key={d.id}>
                  <Card className="h-full transition-shadow hover:shadow-maroon">
                    <CardContent className="flex items-start gap-4 p-5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-maroon-light">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-heading font-semibold">{d.title}</h3>
                        {d.description && <p className="mt-1 text-sm text-muted-foreground">{d.description}</p>}
                        <span className="mt-1 inline-block text-xs text-accent">{categoryLabel(d.category)}</span>
                      </div>
                      <a href={d.file_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
                      </a>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground italic">{t("downloads.empty")}</p>
          )}
        </div>
      </section>
    </Layout>
  );
}

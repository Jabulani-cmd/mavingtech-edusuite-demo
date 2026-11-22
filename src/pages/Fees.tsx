import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export default function Fees() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [docs, setDocs] = useState<Tables<"downloads">[]>([]);

  useEffect(() => {
    supabase
      .from("downloads")
      .select("*")
      .eq("category", "fees")
      .order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setDocs(data); });
  }, []);

  return (
    <Layout>
      <section className="bg-navy py-14 md:py-16">
        <div className="container">
          <h1 className="font-heading text-4xl font-extrabold text-lit md:text-6xl">
            {t("fees.title")}
          </h1>
        </div>
      </section>
      <div className="chevron-band chevron-band-lg" aria-hidden="true" />

      <section className="py-16">
        <div className="container max-w-4xl">
          <p className="mb-4 text-center text-lg text-muted-foreground">
            {t("fees.intro")}
          </p>

          <div className="mb-8 flex justify-center">
            <Button size="lg" className="gap-2" onClick={() => navigate("/pay-online?type=fees")}>
              <CreditCard className="h-5 w-5" /> {t("fees.payOnline")}
            </Button>
          </div>

          {docs.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {docs.map((d, i) => (
                <div key={d.id}>
                  <Card className="h-full transition-shadow hover:shadow-maroon">
                    <CardContent className="flex items-start gap-4 p-5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-maroon-light">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-heading font-semibold">{d.title}</h3>
                        {d.description && <p className="mt-1 text-sm text-muted-foreground">{d.description}</p>}
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
            <p className="text-center text-muted-foreground italic py-8">{t("fees.empty")}</p>
          )}
        </div>
      </section>
    </Layout>
  );
}

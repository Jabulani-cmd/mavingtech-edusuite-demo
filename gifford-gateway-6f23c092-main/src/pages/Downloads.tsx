// @ts-nocheck
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const categoryLabels: Record<string, string> = {
  fees: "Fees & Finance",
  forms: "Forms & Applications",
  policies: "Policies",
  vacancies: "Vacancies",
  general: "General",
};

export default function Downloads() {
  const [downloads, setDownloads] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("downloads").select("*").order("created_at", { ascending: false });
      if (data) setDownloads(data);
    };
    fetch();
  }, []);

  const filtered = filter === "all" ? downloads : downloads.filter(d => d.category === filter);
  const categories = ["all", ...new Set(downloads.map(d => d.category))];

  return (
    <Layout>
      <section className="bg-secondary py-16">
        <div className="container">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-heading text-4xl font-bold text-secondary-foreground">
            Downloads
          </motion.h1>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <div className="mb-8 flex flex-wrap gap-2">
            {categories.map(c => (
              <Button key={c} variant={filter === c ? "default" : "outline"} size="sm" onClick={() => setFilter(c)}>
                {c === "all" ? "All" : categoryLabels[c] || c}
              </Button>
            ))}
          </div>

          {filtered.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((d, i) => (
                <motion.div key={d.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                  <Card className="h-full transition-shadow hover:shadow-maroon">
                    <CardContent className="flex items-start gap-4 p-5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-maroon-light">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-heading font-semibold">{d.title}</h3>
                        {d.description && <p className="mt-1 text-sm text-muted-foreground">{d.description}</p>}
                        <span className="mt-1 inline-block text-xs text-accent">{categoryLabels[d.category] || d.category}</span>
                      </div>
                      <a href={d.file_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
                      </a>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground italic">No documents available for download yet.</p>
          )}
        </div>
      </section>
    </Layout>
  );
}

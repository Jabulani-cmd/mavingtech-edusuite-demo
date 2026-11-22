import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Layout from "@/components/layout/Layout";
import PageHero from "@/components/layout/PageHero";
import heroImg from "@/assets/achievements.png";
import { Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export default function Awards() {
  const { t } = useTranslation();
  const [awards, setAwards] = useState<Tables<"awards">[]>([]);
  const [photos, setPhotos] = useState<Tables<"award_photos">[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [awardsRes, photosRes] = await Promise.all([
        supabase.from("awards").select("*").order("year", { ascending: false }),
        supabase.from("award_photos").select("*").eq("is_active", true).order("created_at", { ascending: false }),
      ]);
      if (awardsRes.data) setAwards(awardsRes.data);
      if (photosRes.data) setPhotos(photosRes.data);
    };
    fetchData();
  }, []);

  return (
    <Layout>
      <PageHero title={t("awards.title")} subtitle={t("awards.subtitle")} image={heroImg} />

      {photos.length > 0 && (
        <section className="container py-12">
          <h2 className="mb-6 font-heading text-2xl font-bold text-primary">{t("awards.galleryTitle")}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo) => (
              <div key={photo.id} className="group overflow-hidden border shadow-sm">
                <div className="aspect-video overflow-hidden">
                  <img src={photo.image_url} alt={photo.caption || "Awards photo"} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                </div>
                {photo.caption && (<p className="p-3 text-sm text-muted-foreground">{photo.caption}</p>)}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="container pb-16 pt-4">
        <h2 className="mb-6 font-heading text-2xl font-bold text-primary">{t("awards.recipientsTitle")}</h2>
        {awards.length === 0 ? (
          <p className="text-muted-foreground">{t("awards.empty")}</p>
        ) : (
          <div className="overflow-x-auto border">
            <table className="w-full text-sm">
              <thead className="bg-primary text-primary-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-heading">{t("awards.studentName")}</th>
                  <th className="px-4 py-3 text-left font-heading">{t("awards.award")}</th>
                  <th className="px-4 py-3 text-left font-heading">{t("awards.year")}</th>
                </tr>
              </thead>
              <tbody>
                {awards.map((a, i) => (
                  <tr key={a.id} className={i % 2 === 0 ? "bg-background" : "bg-muted/50"}>
                    <td className="px-4 py-3 font-medium">{a.recipient}</td>
                    <td className="px-4 py-3 flex items-center gap-2">
                      <Award className="h-4 w-4 text-accent shrink-0" />
                      {a.title}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{a.year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </Layout>
  );
}

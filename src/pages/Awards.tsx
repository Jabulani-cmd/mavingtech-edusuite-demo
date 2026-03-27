// @ts-nocheck
import { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import schoolLogo from "@/assets/mavingtech-logo.png";

export default function Awards() {
  const [awards, setAwards] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [awardsRes, photosRes] = await Promise.all([
        supabase.from("awards").select("*").order("year_issued", { ascending: false }),
        supabase.from("award_photos").select("*").eq("is_active", true).order("created_at", { ascending: false }),
      ]);
      if (awardsRes.data) setAwards(awardsRes.data);
      if (photosRes.data) setPhotos(photosRes.data);
    };
    fetchData();
  }, []);

  return (
    <Layout>
      <section className="bg-gradient-to-br from-primary to-secondary py-16 text-primary-foreground">
        <div className="container text-center">
          <img src={schoolLogo} alt="MavingTech Business Solutions" className="mx-auto mb-4 h-24 w-24 object-contain" />
          <h1 className="font-heading text-4xl font-bold">Awards & Prize-Giving</h1>
          <p className="mt-2 text-lg opacity-90">Celebrating excellence and achievement at MavingTech Business Solutions</p>
        </div>
      </section>

      {/* Photo Gallery */}
      {photos.length > 0 && (
        <section className="container py-12">
          <h2 className="mb-6 font-heading text-2xl font-bold text-primary">Prize-Giving & Awards Gallery</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo) => (
              <div key={photo.id} className="group overflow-hidden rounded-xl border shadow-sm">
                <div className="aspect-video overflow-hidden">
                  <img
                    src={photo.image_url}
                    alt={photo.caption || "Awards photo"}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                {photo.caption && (
                  <p className="p-3 text-sm text-muted-foreground">{photo.caption}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Awards List */}
      <section className="container pb-16 pt-4">
        <h2 className="mb-6 font-heading text-2xl font-bold text-primary">Award Recipients</h2>
        {awards.length === 0 ? (
          <p className="text-muted-foreground">No awards have been published yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-primary text-primary-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-heading">Student Name</th>
                  <th className="px-4 py-3 text-left font-heading">Award</th>
                  <th className="px-4 py-3 text-left font-heading">Year</th>
                </tr>
              </thead>
              <tbody>
                {awards.map((a, i) => (
                  <tr key={a.id} className={i % 2 === 0 ? "bg-background" : "bg-muted/50"}>
                    <td className="px-4 py-3 font-medium">{a.student_name}</td>
                    <td className="px-4 py-3 flex items-center gap-2">
                      <Award className="h-4 w-4 text-accent shrink-0" />
                      {a.award_name}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{a.year_issued}</td>
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

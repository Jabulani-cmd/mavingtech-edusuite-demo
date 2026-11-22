import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

type FacilityImage = {
  id: string;
  image_url: string;
  caption: string | null;
  facility_type: string;
};

const facilityTypeKeys = ["boarding","classrooms","sports","labs","library","clubs","ict","dining","assembly","general"];

export default function Facilities() {
  const { t } = useTranslation();
  const [images, setImages] = useState<FacilityImage[]>([]);

  useEffect(() => {
    supabase.from("facility_images").select("id, image_url, caption, facility_type").eq("is_active", true).order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setImages(data); });
  }, []);

  const facilityTypes = facilityTypeKeys.map(k => ({ value: k, label: t(`facilities.types.${k}`) }));
  const typesWithImages = facilityTypes.filter(ft => images.some(img => img.facility_type === ft.value));

  const lifeItems = [
    { key: "boarding" }, { key: "dining" }, { key: "sports" }, { key: "labs" }, { key: "ict" }, { key: "library" }, { key: "clubs" }, { key: "assembly" }, { key: "general" }
  ];

  return (
    <Layout>
      <section className="bg-navy py-14 md:py-16">
        <div className="container">
          <h1 className="font-heading text-4xl font-extrabold text-lit md:text-6xl">
            {t("facilities.title")}
          </h1>
        </div>
      </section>
      <div className="chevron-band chevron-band-lg" aria-hidden="true" />

      <section className="py-12">
        <div className="container max-w-3xl text-center">
          <p className="text-lg leading-relaxed text-muted-foreground">
            {t("facilities.intro")}
          </p>
        </div>
      </section>

      <section className="bg-ochre-soft py-16">
        <div className="container">
          {typesWithImages.length > 0 ? (
            <Tabs defaultValue={typesWithImages[0]?.value || "boarding"} className="space-y-8">
              <TabsList className="flex flex-wrap justify-center">
                <TabsTrigger value="all">{t("common.all")}</TabsTrigger>
                {typesWithImages.map(ft => (<TabsTrigger key={ft.value} value={ft.value}>{ft.label}</TabsTrigger>))}
              </TabsList>
              <TabsContent value="all"><FacilityGrid images={images} /></TabsContent>
              {typesWithImages.map(ft => (
                <TabsContent key={ft.value} value={ft.value}>
                  <FacilityGrid images={images.filter(img => img.facility_type === ft.value)} />
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <p className="text-center text-muted-foreground italic py-8">{t("facilities.empty")}</p>
          )}
        </div>
      </section>

      <section className="py-16">
        <div className="container max-w-4xl">
          <h2 className="mb-8 text-center font-heading text-3xl font-bold text-primary">{t("facilities.lifeTitle")}</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {lifeItems.map((item, i) => (
              <div key={item.key}>
                <Card className="h-full border-none shadow-maroon">
                  <CardContent className="p-6">
                    <h3 className="font-heading text-lg font-semibold text-primary">{t(`facilities.types.${item.key}`)}</h3>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}

function FacilityGrid({ images }: { images: FacilityImage[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {images.map((img, i) => (
        <div key={img.id}>
          <div className="overflow-hidden shadow-maroon">
            <img src={img.image_url} alt={img.caption || "Facility"} className="h-56 w-full object-cover object-[50%_25%] transition-transform hover:scale-105" />
          </div>
          {img.caption && <p className="mt-2 text-center text-xs text-muted-foreground">{img.caption}</p>}
        </div>
      ))}
    </div>
  );
}

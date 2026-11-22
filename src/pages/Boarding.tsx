import { useTranslation } from "react-i18next";
import Layout from "@/components/layout/Layout";
import PageHero from "@/components/layout/PageHero";
import heroImg from "@/assets/hero-school.png";
import { focus } from "@/lib/photoFocus";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Shield, Utensils, Clock, Users, Heart } from "lucide-react";

const iconMap = { accommodation: Home, safety: Shield, meals: Utensils, study: Clock, community: Users, pastoral: Heart };
const keys = ["accommodation", "safety", "meals", "study", "community", "pastoral"] as const;

export default function Boarding() {
  const { t } = useTranslation();
  return (
    <Layout>
      <PageHero title={t("boarding.title")} subtitle={t("boarding.subtitle")} image={heroImg} focus={focus.heroSchool} />

      <section className="py-16">
        <div className="container">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {keys.map((k, i) => {
              const Icon = iconMap[k];
              return (
                <div key={k}>
                  <Card className="h-full border-primary/10 transition-colors hover:bg-accent">
                    <CardContent className="flex flex-col items-center p-6 text-center">
                      <div className="mb-4 bg-primary/10 p-3"><Icon className="h-8 w-8 text-primary" /></div>
                      <h3 className="mb-2 text-lg font-semibold text-foreground">{t(`boarding.features.${k}.title`)}</h3>
                      <p className="text-sm text-muted-foreground">{t(`boarding.features.${k}.desc`)}</p>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </Layout>
  );
}

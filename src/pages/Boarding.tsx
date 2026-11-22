import { useTranslation } from "react-i18next";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Shield, Utensils, Clock, Users, Heart } from "lucide-react";

const iconMap = { accommodation: Home, safety: Shield, meals: Utensils, study: Clock, community: Users, pastoral: Heart };
const keys = ["accommodation", "safety", "meals", "study", "community", "pastoral"] as const;

export default function Boarding() {
  const { t } = useTranslation();
  return (
    <Layout>
      <section className="bg-background py-16">
        <div className="container">
          <div className="mb-12">
            <h1 className="font-heading text-4xl font-bold text-primary md:text-5xl">{t("boarding.title")}</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">{t("boarding.subtitle")}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {keys.map((k, i) => {
              const Icon = iconMap[k];
              return (
                <div key={k}>
                  <Card className="h-full border-primary/10 transition-colors hover:bg-lit">
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

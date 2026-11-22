import { useTranslation } from "react-i18next";
import Layout from "@/components/layout/Layout";
import PageHero from "@/components/layout/PageHero";
import heroImg from "@/assets/sports.png";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Music, BookOpen, Palette, Users, Volleyball } from "lucide-react";

const sportsKeys = ["rugby","soccer","athletics","swimming","cricket","netball"];
const clubDefs = [
  { key: "choir", icon: Music }, { key: "drama", icon: Palette }, { key: "debate", icon: BookOpen },
  { key: "community", icon: Users }, { key: "chess", icon: Volleyball }, { key: "science", icon: Trophy },
];

const sportsData: Record<string, { name: string; desc: string }> = {
  rugby: { name: "Rugby", desc: "Provincial champions 2024. U-16 and 1st XV teams." },
  soccer: { name: "Soccer", desc: "Boys and girls teams compete in the Inter-Schools League." },
  athletics: { name: "Athletics", desc: "Track & field, cross-country, and inter-house competitions." },
  swimming: { name: "Swimming", desc: "Annual galas and inter-school relay events." },
  cricket: { name: "Cricket", desc: "Boys 1st XI competing at provincial level." },
  netball: { name: "Netball", desc: "Girls teams representing at national level." },
};

const clubsData: Record<string, { name: string; desc: string }> = {
  choir: { name: "Choir & Music", desc: "Award-winning choir performing at national festivals." },
  drama: { name: "Drama Club", desc: "Annual productions and inter-school drama competitions." },
  debate: { name: "Debate Society", desc: "Critical thinking and public speaking development." },
  community: { name: "Community Service", desc: "Outreach programmes and environmental conservation." },
  chess: { name: "Chess Club", desc: "Strategic thinking: provincial finalists 2025." },
  science: { name: "Science Club", desc: "Hands-on experiments and science olympiads." },
};

export default function SportsCulture() {
  const { t } = useTranslation();
  return (
    <Layout>
      <PageHero title={t("sportsCulture.title")} subtitle={t("sportsCulture.subtitle")} image={heroImg} />

      <section className="py-16">
        <div className="container">
          <Tabs defaultValue="sports" className="w-full">
            <TabsList className="mx-auto mb-8 grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="sports">{t("sportsCulture.tabs.sports")}</TabsTrigger>
              <TabsTrigger value="culture">{t("sportsCulture.tabs.culture")}</TabsTrigger>
            </TabsList>

            <TabsContent value="sports">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {sportsKeys.map((k, i) => {
                  const s = sportsData[k];
                  return (
                    <div key={k}>
                      <Card className="h-full border-primary/10 transition-colors hover:bg-lit">
                        <CardContent className="p-6">
                          <h3 className="mb-2 text-lg font-semibold text-foreground">{s.name}</h3>
                          <p className="text-sm text-muted-foreground">{s.desc}</p>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="culture">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {clubDefs.map(({ key, icon: Icon }, i) => {
                  const c = clubsData[key];
                  return (
                    <div key={key}>
                      <Card className="h-full border-primary/10 transition-colors hover:bg-lit">
                        <CardContent className="flex items-start gap-4 p-6">
                          <div className="bg-primary/10 p-2"><Icon className="h-6 w-6 text-primary" /></div>
                          <div>
                            <h3 className="mb-1 text-lg font-semibold text-foreground">{c.name}</h3>
                            <p className="text-sm text-muted-foreground">{c.desc}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
}

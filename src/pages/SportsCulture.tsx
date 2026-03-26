import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Music, BookOpen, Palette, Users, Volleyball } from "lucide-react";

const sports = [
  { name: "Rugby", desc: "Provincial champions 2024. U-16 and 1st XV teams." },
  { name: "Soccer", desc: "Boys and girls teams compete in the Inter-Schools League." },
  { name: "Athletics", desc: "Track & field, cross-country, and inter-house competitions." },
  { name: "Swimming", desc: "Annual galas and inter-school relay events." },
  { name: "Cricket", desc: "Boys 1st XI competing at provincial level." },
  { name: "Netball", desc: "Girls teams representing at national level." },
];

const clubs = [
  { icon: Music, name: "Choir & Music", desc: "Award-winning choir performing at national festivals." },
  { icon: Palette, name: "Drama Club", desc: "Annual productions and inter-school drama competitions." },
  { icon: BookOpen, name: "Debate Society", desc: "Critical thinking and public speaking development." },
  { icon: Users, name: "Community Service", desc: "Outreach programmes and environmental conservation." },
  { icon: Volleyball, name: "Chess Club", desc: "Strategic thinking — provincial finalists 2025." },
  { icon: Trophy, name: "Science Club", desc: "Hands-on experiments and science olympiads." },
];

export default function SportsCulture() {
  return (
    <Layout>
      <section className="bg-gradient-to-b from-primary/5 to-background py-16">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 text-center">
            <h1 className="font-heading text-4xl font-bold text-primary md:text-5xl">Sports & Culture</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Developing well-rounded individuals through sport, arts, and cultural activities.
            </p>
          </motion.div>

          <Tabs defaultValue="sports" className="w-full">
            <TabsList className="mx-auto mb-8 grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="sports">Sports</TabsTrigger>
              <TabsTrigger value="culture">Clubs & Culture</TabsTrigger>
            </TabsList>

            <TabsContent value="sports">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {sports.map((s, i) => (
                  <motion.div key={s.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                    <Card className="h-full border-primary/10 transition-shadow hover:shadow-lg">
                      <CardContent className="p-6">
                        <h3 className="mb-2 text-lg font-semibold text-foreground">{s.name}</h3>
                        <p className="text-sm text-muted-foreground">{s.desc}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="culture">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {clubs.map((c, i) => (
                  <motion.div key={c.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                    <Card className="h-full border-primary/10 transition-shadow hover:shadow-lg">
                      <CardContent className="flex items-start gap-4 p-6">
                        <div className="rounded-full bg-primary/10 p-2">
                          <c.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="mb-1 text-lg font-semibold text-foreground">{c.name}</h3>
                          <p className="text-sm text-muted-foreground">{c.desc}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
}

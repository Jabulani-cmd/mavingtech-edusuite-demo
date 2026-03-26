import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import achievementsImg from "@/assets/achievements.png";
import { BookOpen, FlaskConical, Languages, Calculator, Palette, Laptop } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const subjects = [
  { icon: Calculator, name: "Mathematics", desc: "Pure & Applied Mathematics, Statistics" },
  { icon: FlaskConical, name: "Sciences", desc: "Physics, Chemistry, Biology, Combined Science" },
  { icon: Languages, name: "Languages", desc: "English, Shona, Ndebele, French" },
  { icon: BookOpen, name: "Humanities", desc: "History, Geography, Divinity, Literature" },
  { icon: Laptop, name: "Technical", desc: "Computer Science, Accounting, Commerce" },
  { icon: Palette, name: "Arts", desc: "Art, Music, Drama, Fashion & Fabrics" },
];

const results = [
  { year: "2025", level: "O-Level", rate: "95%", distinctions: 142 },
  { year: "2025", level: "A-Level", rate: "89%", distinctions: 67 },
  { year: "2024", level: "O-Level", rate: "93%", distinctions: 128 },
  { year: "2024", level: "A-Level", rate: "87%", distinctions: 58 },
];

export default function Academics() {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-secondary py-16">
        <div className="container">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-heading text-4xl font-bold text-secondary-foreground">
            Academics
          </motion.h1>
        </div>
      </section>

      {/* Curriculum */}
      <section className="py-16">
        <div className="container">
          <Tabs defaultValue="curriculum">
            <TabsList className="mb-8">
              <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
              <TabsTrigger value="results">Results & Achievements</TabsTrigger>
            </TabsList>

            <TabsContent value="curriculum">
              <div className="mb-8 max-w-2xl">
                <h2 className="font-heading text-2xl font-bold text-primary">Our Curriculum</h2>
                <p className="mt-3 text-muted-foreground">
                  Gifford High offers both the ZIMSEC and Cambridge (CIE) examination streams, giving students the flexibility to pursue local or international qualifications at Ordinary and Advanced Level.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {subjects.map((s, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                    <Card className="h-full transition-shadow hover:shadow-maroon">
                      <CardContent className="flex items-start gap-4 p-5">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-maroon-light">
                          <s.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-heading font-semibold">{s.name}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="results">
              <div className="mb-8 grid items-center gap-10 lg:grid-cols-2">
                <div>
                  <h2 className="font-heading text-2xl font-bold text-primary">Academic Achievements</h2>
                  <p className="mt-3 text-muted-foreground">
                    Our students consistently perform among the top in the province and nationally, with several students earning distinctions in every session.
                  </p>
                  <div className="mt-6 overflow-hidden rounded-lg border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold">Year</th>
                          <th className="px-4 py-3 text-left font-semibold">Level</th>
                          <th className="px-4 py-3 text-left font-semibold">Pass Rate</th>
                          <th className="px-4 py-3 text-left font-semibold">Distinctions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.map((r, i) => (
                          <tr key={i} className="border-t">
                            <td className="px-4 py-3">{r.year}</td>
                            <td className="px-4 py-3">{r.level}</td>
                            <td className="px-4 py-3 font-semibold text-primary">{r.rate}</td>
                            <td className="px-4 py-3">{r.distinctions}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <img src={achievementsImg} alt="Achievements" className="rounded-xl shadow-maroon" />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
}

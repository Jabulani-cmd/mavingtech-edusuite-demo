import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import PageHero from "@/components/layout/PageHero";
import { BookOpen, FlaskConical, Languages, Calculator, Palette, Laptop } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import achievementsImg from "@/assets/achievements.png";
import hero from "@/assets/academics-computers.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6 } }),
};

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
      <PageHero
        eyebrow="Learning & Excellence"
        title="Academics"
        subtitle="A broad, balanced curriculum spanning ZIMSEC and Cambridge streams — designed to prepare every learner for a global future."
        image={hero}
      />

      {/* Intro */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="grid items-end gap-8 lg:grid-cols-2">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Programmes of Study</span>
              <h2 className="mt-3 font-heading text-3xl font-bold leading-tight text-foreground md:text-5xl">
                Our Curriculum
              </h2>
              <div className="mt-5 h-[3px] w-12 bg-primary" />
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="leading-relaxed text-muted-foreground"
            >
              MavingTech offers both the ZIMSEC and Cambridge (CIE) examination streams, giving students the flexibility to pursue local or international qualifications at Ordinary and Advanced Level.
            </motion.p>
          </div>

          <Tabs defaultValue="curriculum" className="mt-14">
            <TabsList className="mb-10">
              <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
              <TabsTrigger value="results">Results & Achievements</TabsTrigger>
            </TabsList>

            <TabsContent value="curriculum">
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {subjects.map((s, i) => (
                  <motion.div
                    key={s.name}
                    custom={i}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                    className="group rounded-lg bg-card p-6 shadow-sm ring-1 ring-border/60 transition-shadow hover:shadow-lg"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                      <s.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="mt-4 font-heading text-lg font-bold text-foreground">{s.name}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="results">
              <div className="grid items-center gap-12 lg:grid-cols-2">
                <div>
                  <h3 className="font-heading text-2xl font-bold text-foreground">Academic Achievements</h3>
                  <div className="mt-4 h-[3px] w-12 bg-primary" />
                  <p className="mt-6 leading-relaxed text-muted-foreground">
                    Our students consistently perform among the top in the province and nationally, with several students earning distinctions every session.
                  </p>
                  <div className="mt-8 overflow-hidden rounded-lg ring-1 ring-border/60">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/60">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold">Year</th>
                          <th className="px-4 py-3 text-left font-semibold">Level</th>
                          <th className="px-4 py-3 text-left font-semibold">Pass Rate</th>
                          <th className="px-4 py-3 text-left font-semibold">Distinctions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.map((r, i) => (
                          <tr key={i} className="border-t border-border/60">
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
                <img src={achievementsImg} alt="Academic achievements" className="rounded-lg shadow-lg" />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
}

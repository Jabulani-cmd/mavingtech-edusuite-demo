import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";

import { Users, Award, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const alumni = [
  { name: "Dr. Tendai Moyo", role: "Surgeon, Parirenyatwa Hospital", year: "Class of 1998" },
  { name: "Nothando Dube", role: "Software Engineer, Google", year: "Class of 2005" },
  { name: "Kudzai Chirwa", role: "Diplomat, United Nations", year: "Class of 2001" },
];

export default function About() {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-secondary py-16">
        <div className="container">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-heading text-4xl font-bold text-secondary-foreground">
            About Gifford High
          </motion.h1>
        </div>
      </section>

      {/* History */}
      <section className="py-16">
        <div className="container max-w-3xl">
          <h2 className="font-heading text-3xl font-bold text-primary">Our History</h2>
          <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Gifford High School, a prestigious government boys' school in Bulawayo, Zimbabwe, was founded in January 1927 as the Bulawayo Technical School, making it the first technical school in what was then Southern Rhodesia. Established to equip boys with practical skills for the young colony, it opened with its founding headmaster, Philip Henry Gifford, a science graduate from the University of Manchester, and just four teachers instructing 39 pupils. The school achieved high school status in 1931 and, in a significant move, relocated to its current site on Matopos Road opposite the Zimbabwe International Trade Fair grounds in 1953. In honour of its long-serving founder, who led the institution for two decades, the school was renamed Gifford Technical High School on 19 August 1961, and was finally shortened to Gifford High School in 1974 when it transitioned to a comprehensive high school. Today, with an enrolment of over 800 students, it continues a legacy of academic and sporting excellence encapsulated in its motto, "Hinc Orior" (From here, I arise).
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-section-warm py-16">
        <div className="container grid gap-6 sm:grid-cols-3">
          {[
            { icon: Users, stat: "2,000+", label: "Students Enrolled" },
            { icon: Award, stat: "95%", label: "O-Level Pass Rate" },
            { icon: Globe, stat: "10,000+", label: "Alumni Worldwide" },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
              <Card className="border-none text-center shadow-maroon">
                <CardContent className="p-8">
                  <s.icon className="mx-auto mb-3 h-8 w-8 text-primary" />
                  <p className="font-heading text-3xl font-bold text-primary">{s.stat}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Alumni */}
      <section className="py-16">
        <div className="container">
          <h2 className="mb-8 font-heading text-3xl font-bold text-primary">Notable Alumni</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {alumni.map((a, i) => (
              <Card key={i} className="transition-shadow hover:shadow-maroon">
                <CardContent className="p-6">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-maroon-light font-heading text-xl font-bold text-primary">
                    {a.name[0]}
                  </div>
                  <h3 className="font-heading text-lg font-semibold">{a.name}</h3>
                  <p className="text-sm text-muted-foreground">{a.role}</p>
                  <p className="mt-1 text-xs font-medium text-accent">{a.year}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}

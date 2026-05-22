import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import PageHero from "@/components/layout/PageHero";
import { Users, Award, Globe } from "lucide-react";
import hero from "@/assets/hero-students-2.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6 } }),
};

const stats = [
  { icon: Users, value: "800+", label: "Students Enrolled" },
  { icon: Award, value: "95%", label: "O-Level Pass Rate" },
  { icon: Globe, value: "10,000+", label: "Alumni Worldwide" },
];

const alumni = [
  { name: "Dr. Tendai Moyo", role: "Surgeon, Parirenyatwa Hospital", year: "Class of 1998" },
  { name: "Nothando Dube", role: "Software Engineer, Google", year: "Class of 2005" },
  { name: "Kudzai Chirwa", role: "Diplomat, United Nations", year: "Class of 2001" },
];

const values = [
  { title: "Excellence", desc: "Striving for the highest standards in every endeavour — academic, sporting and personal." },
  { title: "Integrity", desc: "Honesty, discipline and accountability sit at the heart of our community." },
  { title: "Innovation", desc: "Curiosity and creativity that prepare our students for a fast-changing world." },
];

export default function About() {
  return (
    <Layout>
      <PageHero
        eyebrow="Our Story"
        title="About MavingTech"
        subtitle="Nearly a century of nurturing young African minds into confident leaders, innovators and changemakers."
        image={hero}
      />

      {/* History */}
      <section className="py-20 md:py-28">
        <div className="container grid items-start gap-14 lg:grid-cols-5">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-2"
          >
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Heritage</span>
            <h2 className="mt-4 font-heading text-3xl font-bold leading-tight text-foreground md:text-5xl">
              Our History
            </h2>
            <div className="mt-5 h-[3px] w-12 bg-primary" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-3 space-y-5 leading-relaxed text-muted-foreground"
          >
            <p>
              MavingTech High School, a prestigious government boys' school in Bulawayo, Zimbabwe, was founded in January 1927 as the Bulawayo Technical School, making it the first technical school in what was then Southern Rhodesia.
            </p>
            <p>
              The school achieved high school status in 1931 and, in a significant move, relocated to its current site on Matopos Road opposite the Zimbabwe International Trade Fair grounds in 1953. In honour of its long-serving founder, who led the institution for two decades, the school was renamed MavingTech Technical High School on 19 August 1961, and was finally shortened to MavingTech High School in 1974.
            </p>
            <p>
              Today, with an enrolment of over 800 students, it continues a legacy of academic and sporting excellence encapsulated in its motto, <em>Empowering Your Business Through Technology</em>.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-muted/60 py-16 md:py-20">
        <div className="container grid grid-cols-1 gap-8 sm:grid-cols-3">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="text-center"
            >
              <s.icon className="mx-auto mb-3 h-7 w-7 text-primary" />
              <div className="font-heading text-4xl font-bold text-primary md:text-5xl">{s.value}</div>
              <div className="mt-2 text-sm font-medium text-muted-foreground">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="mb-12 text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">What We Stand For</span>
            <h2 className="mt-3 font-heading text-3xl font-bold text-foreground md:text-5xl">Our Values</h2>
            <div className="mx-auto mt-4 h-[3px] w-12 bg-primary" />
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="rounded-lg bg-card p-8 shadow-sm ring-1 ring-border/60"
              >
                <h3 className="font-heading text-xl font-bold text-foreground">{v.title}</h3>
                <div className="mt-3 h-[2px] w-8 bg-primary" />
                <p className="mt-4 leading-relaxed text-muted-foreground">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Alumni */}
      <section className="bg-muted/40 py-20 md:py-28">
        <div className="container">
          <div className="mb-12 text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Where Our Graduates Are</span>
            <h2 className="mt-3 font-heading text-3xl font-bold text-foreground md:text-5xl">Notable Alumni</h2>
            <div className="mx-auto mt-4 h-[3px] w-12 bg-primary" />
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {alumni.map((a, i) => (
              <motion.div
                key={a.name}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="overflow-hidden rounded-lg bg-card p-6 shadow-sm ring-1 ring-border/60"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 font-heading text-2xl font-bold text-primary">
                  {a.name[0]}
                </div>
                <h3 className="font-heading text-lg font-bold text-foreground">{a.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{a.role}</p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-primary">{a.year}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}

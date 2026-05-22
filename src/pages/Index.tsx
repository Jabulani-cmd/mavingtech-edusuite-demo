// @ts-nocheck
import { useState, useEffect, forwardRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import schoolLogo from "@/assets/mavingtech-logo.png";
import hero1 from "@/assets/hero-students-1.jpg";
import hero2 from "@/assets/hero-students-2.jpg";
import hero3 from "@/assets/hero-students-3.jpg";
import hero4 from "@/assets/hero-students-4.jpg";
import hero5 from "@/assets/hero-students-5.jpg";
import currCs from "@/assets/curriculum-cs.jpg";
import currMath from "@/assets/curriculum-math.jpg";
import currLit from "@/assets/curriculum-literature.jpg";
import currSci from "@/assets/curriculum-science.jpg";
import currArts from "@/assets/curriculum-arts.jpg";
import currPerf from "@/assets/curriculum-performing.jpg";
import actSports from "@/assets/activity-sports.jpg";
import actMusic from "@/assets/activity-music.jpg";
import actArts from "@/assets/activity-arts.jpg";
import actClubs from "@/assets/activity-clubs.jpg";
import { supabase } from "@/integrations/supabase/client";

const heroImages = [hero1, hero2, hero3, hero4, hero5];


/* ---------- Director Photo ---------- */
const DirectorPhoto = forwardRef<HTMLDivElement>(function DirectorPhoto(_props, ref) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  useEffect(() => {
    supabase
      .from("site_settings")
      .select("setting_value")
      .eq("setting_key", "principal_photo")
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0 && data[0].setting_value) setPhotoUrl(data[0].setting_value);
      });
  }, []);

  return (
    <div ref={ref} className="relative">
      {photoUrl ? (
        <img src={photoUrl} alt="The Director" className="aspect-[4/5] w-full rounded-lg object-cover object-top shadow-xl" />
      ) : (
        <div className="flex aspect-[4/5] w-full items-center justify-center rounded-lg bg-muted shadow-xl">
          <img src={schoolLogo} alt="MavingTech" className="h-32 w-32 object-contain opacity-30" />
        </div>
      )}
    </div>
  );
});

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6 } }),
};

const stats = [
  { value: "800+", label: "Current Enrollments" },
  { value: "45+", label: "Qualified Staff" },
  { value: "24+", label: "Clubs & Activities" },
  { value: "30+", label: "Active PTFA Members" },
];

const curriculum = [
  {
    title: "Computer Science",
    desc: "Hands-on experience with the latest programming languages and technology.",
    img: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=70",
  },
  {
    title: "Mathematics",
    desc: "Building strong analytical foundations through engaging, real-world problem solving.",
    img: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=70",
  },
  {
    title: "Literature & Languages",
    desc: "Cultivating expression, comprehension and a lifelong love of reading and writing.",
    img: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=800&q=70",
  },
  {
    title: "Sciences",
    desc: "Inquiry-led learning in physics, chemistry and biology with modern lab facilities.",
    img: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=70",
  },
  {
    title: "Visual Arts",
    desc: "Creative studios where students explore drawing, painting, design and craft.",
    img: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=70",
  },
  {
    title: "Performing Arts",
    desc: "Music, drama and dance programmes that build confidence and collaboration.",
    img: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=70",
  },
];

const activities = [
  { title: "Sports", img: "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=800&q=70" },
  { title: "Music", img: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=70" },
  { title: "Arts & Crafts", img: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=800&q=70" },
  { title: "Clubs", img: "https://images.unsplash.com/photo-1529390079861-591de354faf5?auto=format&fit=crop&w=800&q=70" },
];

export default function Home() {
  const [announcements, setAnnouncements] = useState<{ id: string; title: string; content: string | null; created_at: string }[]>([]);

  useEffect(() => {
    supabase
      .from("announcements")
      .select("*")
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(3)
      .then(({ data }) => {
        if (data) setAnnouncements(data);
      });
  }, []);

  return (
    <Layout>
      {/* ===== HERO ===== */}
      <section className="relative isolate overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1571260899304-425eee4c7efc?auto=format&fit=crop&w=2000&q=80"
          alt="Students in classroom"
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        <div className="container py-32 md:py-44">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl text-white"
          >
            <div className="mb-6 h-[2px] w-12 bg-white" />
            <h1 className="font-heading text-4xl font-bold leading-tight md:text-6xl lg:text-7xl">
              Welcome to MavingTech
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-white/85 md:text-lg">
              This is where we teach students skills they need to transform themselves, others, and our global communities.
            </p>
            <Link to="/academics" className="mt-10 inline-block">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Our Academics
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ===== LEARNING BEGINS WITH US ===== */}
      <section className="py-20 md:py-28">
        <div className="container grid items-center gap-14 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <h2 className="font-heading text-3xl font-bold leading-tight text-foreground md:text-5xl">
              Learning Begins<br /> With Us
            </h2>
            <div className="mt-5 h-[3px] w-12 bg-primary" />
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <p className="leading-relaxed text-muted-foreground">
              We, at MavingTech, offer supportive and inspirational environments for young enquiring minds to learn and grow with us. Our passion for learning means we achieve more than outstanding results. We strive to build confident and creative thinkers and aim at delivering an education that is truly relevant to their future.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              We are an early learning academy focused on social-emotional development and early literacy and numeracy. Our students walk out with the character and confidence to make their mark in the world.
            </p>
            <Link to="/about" className="mt-8 inline-block">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Know More About Us
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="bg-muted/60 py-16 md:py-20">
        <div className="container grid grid-cols-2 gap-8 md:grid-cols-4">
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
              <div className="text-sm font-medium text-muted-foreground">{s.label}</div>
              <div className="mt-2 font-heading text-4xl font-bold text-primary md:text-5xl">{s.value}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== DIRECTOR QUOTE ===== */}
      <section className="py-20 md:py-28">
        <div className="container grid items-center gap-12 lg:grid-cols-5">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-2"
          >
            <DirectorPhoto />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-3"
          >
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Message from the Director</span>
            <h2 className="mt-4 font-heading text-3xl font-bold leading-tight text-foreground md:text-4xl">
              From the Director's Desk
            </h2>
            <div className="mt-4 h-[3px] w-12 bg-primary" />
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground italic">
              "We aim at inspiring our students to dream more, learn more, do more, and become more in their respective journeys with MavingTech High School."
            </p>
            <p className="mt-6 leading-relaxed text-muted-foreground">
              Welcome to MavingTech High School. We are a technology-driven company dedicated to empowering organisations with innovative software solutions that streamline operations, enhance communication, and drive efficiency.
            </p>
            <p className="mt-6 font-heading text-base font-semibold text-foreground">
              Mr. F.J. Moyo <span className="font-normal text-muted-foreground">— The Director, MavingTech High School</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===== CURRICULUM OVERVIEW ===== */}
      <section className="bg-muted/40 py-20 md:py-28">
        <div className="container">
          <div className="grid items-end gap-8 lg:grid-cols-2">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="font-heading text-3xl font-bold leading-tight text-foreground md:text-5xl">
                Curriculum Overview
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
              MavingTech aims at offering all our students a broad and balanced curriculum that provides rewarding and stimulating activities to prepare them for the best social and cultural life.
            </motion.p>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {curriculum.map((c, i) => (
              <motion.div
                key={c.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="group overflow-hidden rounded-lg bg-card shadow-sm ring-1 ring-border/60 transition-shadow hover:shadow-lg"
              >
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  <img
                    src={c.img}
                    alt={c.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-heading text-lg font-bold text-foreground">{c.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ACTIVITIES ===== */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="mb-12 text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Beyond the Classroom</span>
            <h2 className="mt-3 font-heading text-3xl font-bold text-foreground md:text-5xl">Activities</h2>
            <div className="mx-auto mt-4 h-[3px] w-12 bg-primary" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {activities.map((a, i) => (
              <motion.div
                key={a.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="group relative aspect-[4/5] overflow-hidden rounded-lg"
              >
                <img src={a.img} alt={a.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h3 className="font-heading text-xl font-semibold text-white">{a.title}</h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== LATEST NEWS ===== */}
      {announcements.length > 0 && (
        <section className="bg-muted/40 py-20 md:py-28">
          <div className="container">
            <div className="mb-12 text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Latest Updates</span>
              <h2 className="mt-3 font-heading text-3xl font-bold text-foreground md:text-5xl">News & Announcements</h2>
              <div className="mx-auto mt-4 h-[3px] w-12 bg-primary" />
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {announcements.map((a, i) => (
                <motion.article
                  key={a.id}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="overflow-hidden rounded-lg bg-card p-6 shadow-sm ring-1 ring-border/60"
                >
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                    {new Date(a.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  <h3 className="mt-3 font-heading text-lg font-bold text-foreground">{a.title}</h3>
                  {a.content && (
                    <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-muted-foreground">{a.content}</p>
                  )}
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== CTA ===== */}
      <section className="relative isolate overflow-hidden bg-primary py-20 text-primary-foreground md:py-24">
        <div className="container text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-heading text-3xl font-bold md:text-5xl"
          >
            Begin Your Journey With Us
          </motion.h2>
          <p className="mx-auto mt-5 max-w-2xl leading-relaxed text-white/85">
            Join a community committed to academic excellence, character, and innovation. Admissions are open.
          </p>
          <Link to="/admissions" className="mt-8 inline-block">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90">
              Apply Now <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}

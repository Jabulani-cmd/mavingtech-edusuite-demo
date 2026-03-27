// @ts-nocheck
import { useState, useEffect, forwardRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Users, Trophy, GraduationCap, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/layout/Layout";
import HeroCarousel from "@/components/HeroCarousel";
import classroomImg from "@/assets/classroom.png";
import achievementsImg from "@/assets/achievements.png";
import schoolLogo from "@/assets/school-logo.png";

import { supabase } from "@/integrations/supabase/client";

/* ---------- Principal Photo Component ---------- */
const PrincipalPhoto = forwardRef<HTMLDivElement>(function PrincipalPhoto(_props, ref) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("site_settings")
      .select("setting_value")
      .eq("setting_key", "principal_photo")
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0 && data[0].setting_value) {
          setPhotoUrl(data[0].setting_value);
        } else {
          supabase
            .from("staff")
            .select("photo_url")
            .or("title.ilike.%principal%,title.ilike.%head%master%")
            .limit(1)
            .then(({ data: staffData }) => {
              if (staffData && staffData.length > 0 && staffData[0].photo_url) {
                setPhotoUrl(staffData[0].photo_url);
              }
            });
        }
      });
  }, []);

  return (
    <div ref={ref} className="relative">
      {photoUrl ? (
        <img
          src={photoUrl}
          alt="The Principal"
          className="aspect-[3/4] w-full rounded-xl object-cover object-top shadow-2xl lg:aspect-[4/5]"
        />
      ) : (
        <div className="flex h-[420px] w-full items-center justify-center rounded-xl bg-muted shadow-2xl">
          <img src={schoolLogo} alt="MavingTech Business Solutions" className="h-32 w-32 object-contain opacity-40" />
        </div>
      )}
      <div className="absolute -bottom-4 left-6 rounded-lg bg-secondary px-5 py-2.5 shadow-lg">
        <span className="text-sm font-bold text-secondary-foreground">Mrs. B. Dewa</span>
      </div>
    </div>
  );
});

/* ---------- Animations ---------- */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.12, duration: 0.6 } }),
};

/* ---------- Quick links (Woodberry-style icon cards) ---------- */
const quickLinks = [
  { icon: BookOpen, label: "Academics", path: "/academics", desc: "Curriculum & programmes" },
  { icon: GraduationCap, label: "Admissions", path: "/admissions", desc: "Apply to join us" },
  { icon: Users, label: "School Life", path: "/school-life", desc: "Beyond the classroom" },
];

/* ---------- Highlights ---------- */
const highlights = [
  { title: "Academic Excellence", desc: "Cambridge & ZIMSEC curriculum with outstanding pass rates." },
  { title: "Sporting Achievements", desc: "Provincial and national champions in rugby, soccer, and athletics." },
  { title: "Vibrant Community", desc: "Over 20 clubs and societies fostering holistic student development." },
  { title: "Rich Heritage", desc: "Decades of tradition shaping tomorrow's leaders since 1927." },
];

/* ---------- Facility images for the stats/facts carousel ---------- */
const stats = [
  { value: "1927", label: "Year Founded" },
  { value: "800+", label: "Students" },
  { value: "45+", label: "Teaching Staff" },
  { value: "96%", label: "Pass Rate" },
];

export default function Home() {
  const [announcements, setAnnouncements] = useState<{ id: string; title: string; content: string | null; created_at: string }[]>([]);
  const [achievementsImage, setAchievementsImage] = useState<string | null>(null);
  const [traditionImage, setTraditionImage] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [ctaImage, setCtaImage] = useState<string | null>(null);
  const [facilityImages, setFacilityImages] = useState<any[]>([]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const { data } = await supabase
        .from("announcements")
        .select("*")
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(4);
      if (data) setAnnouncements(data);
    };
    const fetchSiteImages = async () => {
      const { data } = await supabase.from("site_settings").select("setting_key, setting_value").in("setting_key", ["achievements_image", "tradition_image", "cta_image"]);
      if (data) {
        data.forEach((s) => {
          if (s.setting_key === "achievements_image") setAchievementsImage(s.setting_value);
          if (s.setting_key === "tradition_image") setTraditionImage(s.setting_value);
          if (s.setting_key === "cta_image") setCtaImage(s.setting_value);
        });
      }
    };
    fetchAnnouncements();
    fetchSiteImages();
    supabase.from("school_projects").select("*").eq("is_active", true).order("created_at", { ascending: false }).limit(3).then(({ data }) => { if (data) setProjects(data); });
    supabase.from("facility_images").select("*").eq("is_active", true).limit(4).then(({ data }) => { if (data) setFacilityImages(data); });
  }, []);

  return (
    <Layout>
      {/* ===== FULL-SCREEN HERO ===== */}
      <HeroCarousel />

      {/* ===== TAGLINE + QUICK LINKS (Woodberry: "A Brotherhood" section) ===== */}
      <section className="bg-primary py-16 md:py-24">
        <div className="container text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-heading text-3xl font-bold text-white md:text-5xl"
          >
            Welcome to MavingTech Business Solutions
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/70 md:text-lg"
          >
            A beacon of excellence in education since 1927 — nurturing young minds to become leaders, innovators, and responsible citizens.
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-3 font-heading text-sm italic text-secondary"
          >
            Empowering Your Business Through Technology
          </motion.p>

          {/* Quick link cards — Woodberry-style icon cards */}
          <div className="mx-auto mt-12 grid max-w-3xl gap-6 sm:grid-cols-3">
            {quickLinks.map((ql, i) => (
              <motion.div key={ql.label} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <Link to={ql.path} className="group block">
                  <div className="flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-6 py-8 transition-all hover:border-secondary/50 hover:bg-white/10">
                    <img src={schoolLogo} alt="MavingTech Business Solutions crest" className="h-10 w-10 object-contain" />
                    <span className="font-heading text-sm font-bold uppercase tracking-wider text-white">{ql.label}</span>
                    <span className="text-xs text-white/50">{ql.desc}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STATS BAR (Woodberry: Fast Facts carousel) ===== */}
      <section className="border-y border-border bg-background">
        <div className="container grid grid-cols-2 divide-x divide-border md:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="flex flex-col items-center py-10 md:py-14"
            >
              <span className="font-heading text-3xl font-bold text-secondary md:text-4xl">{s.value}</span>
              <span className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">{s.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== PRINCIPAL'S MESSAGE (Woodberry: side-by-side image+text) ===== */}
      <section className="py-20 md:py-28">
        <div className="container grid items-center gap-12 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <PrincipalPhoto />
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">Message from the Principal</span>
            <h2 className="mt-3 font-heading text-3xl font-bold text-foreground md:text-4xl">From the Principal's Desk</h2>
            <div className="mt-1 h-1 w-16 bg-secondary" />
            <p className="mt-6 leading-relaxed text-muted-foreground">
              It is with great pride and pleasure that I welcome you to MavingTech Business Solutions. Our institution has been a beacon of excellence in education since 1927, nurturing young minds to become leaders, innovators, and responsible citizens.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              At MavingTech, we believe in holistic education — combining rigorous academics with vibrant sporting and cultural programmes. Our dedicated staff work tirelessly to ensure every student reaches their full potential.
            </p>
            <p className="mt-4 font-heading text-sm font-semibold italic text-foreground">
              — The Principal, MavingTech Business Solutions
            </p>
            <Link to="/about" className="mt-8 inline-block">
              <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 uppercase tracking-wider text-xs font-semibold px-8">
                Learn More <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ===== ANNOUNCEMENTS (Woodberry: Featured News grid) ===== */}
      <section className="bg-primary py-20 md:py-28">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">Latest Updates</span>
            <h2 className="mt-3 font-heading text-3xl font-bold text-white md:text-4xl">Announcements</h2>
            <div className="mx-auto mt-3 h-1 w-16 bg-secondary" />
          </motion.div>

          {announcements.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {announcements.map((a, i) => (
                <motion.div key={a.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                  <Card className="h-full border-white/10 bg-white/5 backdrop-blur transition-all hover:bg-white/10 hover:border-secondary/30">
                    <CardContent className="p-7">
                      <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
                        {new Date(a.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                      <h3 className="mt-3 font-heading text-lg font-semibold text-white">{a.title}</h3>
                      {a.content && <p className="mt-2 text-sm leading-relaxed text-white/60">{a.content}</p>}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-center text-white/50 italic">No announcements at this time.</p>
          )}
        </div>
      </section>

      {/* ===== WHY GIFFORD HIGH (Woodberry: icon feature grid) ===== */}
      <section className="py-20 md:py-28">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-14 text-center"
          >
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">Discover</span>
            <h2 className="mt-3 font-heading text-3xl font-bold text-foreground md:text-4xl">Why MavingTech?</h2>
            <div className="mx-auto mt-3 h-1 w-16 bg-secondary" />
          </motion.div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {highlights.map((h, i) => (
              <motion.div key={h.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <div className="group flex flex-col items-center text-center">
                  <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-full border-2 border-secondary/20 transition-colors group-hover:border-secondary/60">
                    <img src={schoolLogo} alt="MavingTech Business Solutions" className="h-14 w-14 object-contain" />
                  </div>
                  <h3 className="mb-2 font-heading text-lg font-bold text-foreground">{h.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{h.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TRADITION OF EXCELLENCE (Woodberry: "Distinctly Woodberry" — image + text side-by-side) ===== */}
      <section className="bg-muted/50 py-20 md:py-28">
        <div className="container grid items-center gap-12 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <img
              src={traditionImage || classroomImg}
              alt="Students in classroom"
              className="w-full rounded-xl shadow-2xl object-cover"
              style={{ maxHeight: 480 }}
            />
          </motion.div>
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">Our Heritage</span>
            <h2 className="mt-3 font-heading text-3xl font-bold text-foreground md:text-4xl">A Tradition of Excellence</h2>
            <div className="mt-3 h-1 w-16 bg-secondary" />
            <p className="mt-6 leading-relaxed text-muted-foreground">
              Founded in 1927, MavingTech Business Solutions has been a cornerstone of education in Bulawayo. Our students consistently achieve top results in both ZIMSEC and Cambridge examinations, and our alumni hold distinguished positions across the globe.
            </p>
            <Link to="/about" className="mt-8 inline-block">
              <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 uppercase tracking-wider text-xs font-semibold px-8">
                About Us <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ===== CELEBRATING ACHIEVEMENT ===== */}
      <section className="py-20 md:py-28">
        <div className="container grid items-center gap-12 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="order-2 lg:order-1">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">Results</span>
            <h2 className="mt-3 font-heading text-3xl font-bold text-foreground md:text-4xl">Celebrating Achievement</h2>
            <div className="mt-3 h-1 w-16 bg-secondary" />
            <p className="mt-6 leading-relaxed text-muted-foreground">
              Our students consistently excel in national examinations, inter-school competitions, and sporting events. We celebrate every milestone, from academic honours to sportsmanship awards.
            </p>
            <Link to="/academics" className="mt-8 inline-block">
              <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 uppercase tracking-wider text-xs font-semibold px-8">
                View Academics <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="order-1 lg:order-2">
            <img
              src={achievementsImage || achievementsImg}
              alt="Students celebrating achievements"
              className="w-full rounded-xl shadow-2xl object-cover"
              style={{ maxHeight: 480 }}
            />
          </motion.div>
        </div>
      </section>

      {/* ===== SCHOOL PROJECTS (Woodberry: card grid) ===== */}
      {projects.length > 0 && (
        <section className="bg-primary py-20 md:py-28">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12 text-center"
            >
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">Community</span>
              <h2 className="mt-3 font-heading text-3xl font-bold text-white md:text-4xl">School Projects</h2>
              <div className="mx-auto mt-3 h-1 w-16 bg-secondary" />
              <p className="mx-auto mt-4 max-w-xl text-white/60">See what our students and staff have been working on.</p>
            </motion.div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p, i) => (
                <motion.div key={p.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                  <Card className="h-full overflow-hidden border-white/10 bg-white/5 transition-all hover:bg-white/10 hover:border-secondary/30">
                    {p.image_url && (
                      <div className="aspect-video w-full overflow-hidden">
                        <img src={p.image_url} alt={p.title} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
                      </div>
                    )}
                    <CardContent className="p-6">
                      <h3 className="font-heading text-lg font-semibold text-white">{p.title}</h3>
                      {p.description && <p className="mt-2 text-sm text-white/60 line-clamp-2">{p.description}</p>}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link to="/school-projects">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 uppercase tracking-wider text-xs font-semibold px-8">
                  View All Projects <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ===== CONTACT / GET IN TOUCH ===== */}
      <section className="py-20 md:py-28">
        <div className="container text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">Connect</span>
            <h2 className="mt-3 font-heading text-3xl font-bold text-foreground md:text-4xl">Get in Touch</h2>
            <div className="mx-auto mt-3 h-1 w-16 bg-secondary" />
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="mx-auto mt-5 max-w-2xl text-muted-foreground"
          >
            Have questions or need to meet with our school authorities? We're here to help. Reach out or book an appointment today.
          </motion.p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/contact">
              <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 uppercase tracking-wider text-xs font-semibold px-10">
                Contact Us <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/contact?tab=appointment">
              <Button size="lg" variant="outline" className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground uppercase tracking-wider text-xs font-semibold px-10">
                Book an Appointment
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== CTA BANNER (Woodberry: "Experience More" footer CTA) ===== */}
      <section className="relative overflow-hidden">
        {/* Background — large image or gradient */}
        <div className="absolute inset-0 bg-primary" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/95 to-primary/80" />

        <div className="container relative z-10 grid items-center gap-10 py-20 md:py-28 lg:grid-cols-2">
          <div>
            <h2 className="font-heading text-3xl font-bold text-white md:text-5xl">
              Ready to Join the{" "}
              <span className="text-secondary">MavingTech Family?</span>
            </h2>
            <p className="mt-5 max-w-lg text-white/70">
              Applications for the next academic year are now open. Take the first step towards a world-class education.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/admissions">
                <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 uppercase tracking-wider text-xs font-semibold px-10">
                  Apply Now <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="border-secondary bg-secondary/10 text-white hover:bg-secondary/20 uppercase tracking-wider text-xs font-semibold px-10">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>

          <div className="hidden lg:flex items-center justify-center">
            {ctaImage ? (
              <img src={ctaImage} alt="Join MavingTech Business Solutions" className="h-80 w-80 rounded-xl object-cover shadow-lg" />
            ) : (
              <div className="flex h-80 w-80 items-center justify-center rounded-xl border-2 border-dashed border-white/30 bg-white/10">
                <img src={schoolLogo} alt="MavingTech Business Solutions" className="h-32 w-32 object-contain opacity-40" />
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}

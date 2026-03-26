// @ts-nocheck
import { useState, useEffect, forwardRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/layout/Layout";
import HeroCarousel from "@/components/HeroCarousel";
import classroomImg from "@/assets/classroom.png";
import achievementsImg from "@/assets/achievements.png";
import schoolLogo from "@/assets/school-logo.png";
import { supabase } from "@/integrations/supabase/client";

const PrincipalPhoto = forwardRef<HTMLDivElement>(function PrincipalPhoto(_props, ref) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    // First try site_settings (admin-uploaded principal photo)
    supabase
      .from("site_settings")
      .select("setting_value")
      .eq("setting_key", "principal_photo")
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0 && data[0].setting_value) {
          setPhotoUrl(data[0].setting_value);
        } else {
          // Fallback: look for a staff member with "principal" in title
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
    <div ref={ref} className="flex justify-center">
      <div className="relative">
        {photoUrl ? (
          <img src={photoUrl} alt="The Principal" className="h-80 w-64 rounded-xl object-cover object-top shadow-maroon" />
        ) : (
          <div className="flex h-80 w-64 items-center justify-center rounded-xl bg-maroon-light shadow-maroon">
            <img src={schoolLogo} alt="Gifford High School" className="h-32 w-32 object-contain opacity-60" />
          </div>
        )}
        <div className="absolute -bottom-4 -right-4 rounded-lg bg-primary px-4 py-2 shadow-lg">
          <span className="text-xs font-bold text-primary-foreground">Mrs. B. Dewa</span>
        </div>
      </div>
    </div>
  );
});

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.15, duration: 0.6 } }),
};

const highlights = [
  { title: "Academic Excellence", desc: "Cambridge & ZIMSEC curriculum with outstanding pass rates." },
  { title: "Sporting Achievements", desc: "Provincial and national champions in rugby, soccer, and athletics." },
  { title: "Vibrant Community", desc: "Over 20 clubs and societies fostering holistic student development." },
  { title: "Rich Heritage", desc: "Decades of tradition shaping tomorrow's leaders since 1927." },
];

export default function Home() {
  const [announcements, setAnnouncements] = useState<{ id: string; title: string; content: string | null; created_at: string }[]>([]);
  const [achievementsImage, setAchievementsImage] = useState<string | null>(null);
  const [traditionImage, setTraditionImage] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>([]);

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
      const { data } = await supabase.from("site_settings").select("setting_key, setting_value").in("setting_key", ["achievements_image", "tradition_image"]);
      if (data) {
        data.forEach((s) => {
          if (s.setting_key === "achievements_image") setAchievementsImage(s.setting_value);
          if (s.setting_key === "tradition_image") setTraditionImage(s.setting_value);
        });
      }
    };
    fetchAnnouncements();
    fetchSiteImages();
    supabase.from("school_projects").select("*").eq("is_active", true).order("created_at", { ascending: false }).limit(3).then(({ data }) => { if (data) setProjects(data); });
  }, []);

  return (
    <Layout>
      <HeroCarousel />

      {/* Welcome Statement */}
      <section className="bg-section-warm py-16">
        <div className="container text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-heading text-4xl font-bold text-foreground md:text-5xl"
          >
            Welcome to Gifford High School
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground"
          >
            A beacon of excellence in education since 1927 — nurturing young minds to become leaders, innovators, and responsible citizens.
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-2 font-heading text-sm italic text-secondary"
          >
            Hinc Orior — From Here I Arise
          </motion.p>
        </div>
      </section>

      {/* Principal's Message */}
      <section className="py-20">
        <div className="container grid items-center gap-12 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <PrincipalPhoto />
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <span className="text-xs font-semibold uppercase tracking-wider text-secondary">Message from the Principal</span>
            <h2 className="mt-2 font-heading text-3xl font-bold text-foreground">From the Principal's Desk</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              It is with great pride and pleasure that I welcome you to Gifford High School. Our institution has been a beacon of excellence in education since 1927, nurturing young minds to become leaders, innovators, and responsible citizens.
            </p>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              At Gifford, we believe in holistic education — combining rigorous academics with vibrant sporting and cultural programmes. Our dedicated staff work tirelessly to ensure every student reaches their full potential.
            </p>
            <p className="mt-3 font-heading text-sm font-semibold text-foreground italic">
              — The Principal, Gifford High School
            </p>
            <Link to="/about" className="mt-6 inline-block">
              <Button variant="outline" className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground">
                Learn More <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Announcements */}
      <section className="bg-section-warm py-20">
        <div className="container">
          <h2 className="mb-10 text-center font-heading text-3xl font-bold text-foreground">Announcements</h2>
          {announcements.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {announcements.map((a, i) => (
                <motion.div key={a.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                  <Card className="h-full transition-shadow hover:shadow-maroon">
                    <CardContent className="p-6">
                      <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
                        {new Date(a.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                      <h3 className="mt-2 font-heading text-lg font-semibold">{a.title}</h3>
                      {a.content && <p className="mt-2 text-sm text-muted-foreground">{a.content}</p>}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground italic">No announcements at this time.</p>
          )}
        </div>
      </section>

      {/* Why Gifford High */}
      <section className="py-20">
        <div className="container">
          <h2 className="mb-12 text-center font-heading text-3xl font-bold text-foreground">Why Gifford High?</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {highlights.map((h, i) => (
              <motion.div key={h.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <Card className="h-full border-none shadow-maroon transition-transform hover:-translate-y-1">
                  <CardContent className="flex flex-col items-center p-6 text-center">
                    <div className="mb-4 flex h-28 w-28 items-center justify-center rounded-full">
                      <img src={schoolLogo} alt="Gifford High School" className="h-20 w-20 object-contain" />
                    </div>
                    <h3 className="mb-2 font-heading text-lg font-semibold">{h.title}</h3>
                    <p className="text-sm text-muted-foreground">{h.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* A Tradition of Excellence */}
      <section className="bg-section-warm py-20">
        <div className="container grid items-center gap-12 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="order-2 lg:order-1">
            <h2 className="font-heading text-3xl font-bold text-foreground">A Tradition of Excellence</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Founded in 1927, Gifford High School has been a cornerstone of education in Bulawayo. Our students consistently achieve top results in both ZIMSEC and Cambridge examinations, and our alumni hold distinguished positions across the globe.
            </p>
            <Link to="/about" className="mt-6 inline-block">
              <Button variant="outline" className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground">
                About Us <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="order-1 lg:order-2">
            <img src={traditionImage || classroomImg} alt="Students in classroom" className="rounded-xl shadow-maroon" />
          </motion.div>
        </div>
      </section>

      {/* Celebrating Achievement */}
      <section className="py-20">
        <div className="container grid items-center gap-12 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="order-2 lg:order-1">
            <h2 className="font-heading text-3xl font-bold text-foreground">Celebrating Achievement</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Our students consistently excel in national examinations, inter-school competitions, and sporting events. We celebrate every milestone, from academic honours to sportsmanship awards.
            </p>
            <Link to="/academics" className="mt-6 inline-block">
              <Button variant="outline" className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground">
                View Academics <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="order-1 lg:order-2">
            <img src={achievementsImage || achievementsImg} alt="Students celebrating achievements" className="rounded-xl shadow-maroon" />
          </motion.div>
        </div>
      </section>

      {/* School Projects */}
      {projects.length > 0 && (
        <section className="bg-section-warm py-20">
          <div className="container">
            <h2 className="mb-4 text-center font-heading text-3xl font-bold text-foreground">School Projects</h2>
            <p className="mx-auto mb-10 max-w-xl text-center text-muted-foreground">See what our students and staff have been working on.</p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p, i) => (
                <motion.div key={p.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                  <Card className="h-full overflow-hidden border-none shadow-maroon transition-transform hover:-translate-y-1">
                    {p.image_url && (
                      <div className="aspect-video w-full overflow-hidden">
                        <img src={p.image_url} alt={p.title} className="h-full w-full object-cover" />
                      </div>
                    )}
                    <CardContent className="p-6">
                      <h3 className="font-heading text-lg font-semibold">{p.title}</h3>
                      {p.description && <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{p.description}</p>}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link to="/school-projects">
                <Button variant="outline" className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground">
                  View All Projects <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Contact Us */}
      <section className="py-20">
        <div className="container text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-heading text-3xl font-bold text-foreground"
          >
            Get in Touch
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-4 max-w-2xl text-muted-foreground"
          >
            Have questions or need to meet with our school authorities? We're here to help. Reach out or book an appointment today.
          </motion.p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/contact">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Contact Us <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/contact?tab=appointment">
              <Button size="lg" variant="outline" className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground">
                Book an Appointment <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-maroon-gradient py-16">
        <div className="container text-center">
          <h2 className="font-heading text-3xl font-bold text-primary-foreground">Ready to Join the Gifford Family?</h2>
          <p className="mx-auto mt-3 max-w-lg text-primary-foreground/80">
            Applications for the next academic year are now open. Take the first step towards a world-class education.
          </p>
          <Link to="/admissions" className="mt-8 inline-block">
            <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
              Apply Now <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}

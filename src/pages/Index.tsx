import { useState, useEffect, forwardRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import heroCampus from "@/assets/hero-campus.jpg";
import heroCampusPhone from "@/assets/hero-campus-phone.jpg";
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
import principalPhoto from "@/assets/principal-moyo.jpg";

// `hasText` slides carry the welcome text and logo in the picture itself, so the live headline is hidden on them
// from tablet width up. `phoneSrc` is a tall, text-free crop used on phones, where the headline is shown as usual.
type HeroSlide = { src: string; phoneSrc?: string; hasText?: boolean };

const heroSlides: HeroSlide[] = [
  { src: heroCampus, phoneSrc: heroCampusPhone, hasText: true },
  ...[hero1, hero2, hero3, hero4, hero5].map((src): HeroSlide => ({ src })),
];

const DirectorPhoto = forwardRef<HTMLDivElement>(function DirectorPhoto(_props, ref) {
  return (
    <div ref={ref} className="relative">
      <img src={principalPhoto} alt="Mr. F.J. Moyo, Principal" className="aspect-[4/5] w-full rounded-lg object-cover object-top shadow-xl" />
    </div>
  );
});

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6 } }),
};

export default function Home() {
  const { t } = useTranslation();
  const [announcements, setAnnouncements] = useState<{ id: string; title: string; content: string | null; created_at: string }[]>([]);
  const [slide, setSlide] = useState(0);
  const slides = heroSlides;
  const current = slides[slide];
  const [prev, setPrev] = useState(-1);

  const stats = [
    { value: "800+", label: t("home.stats.enrollments") },
    { value: "45+", label: t("home.stats.staff") },
    { value: "24+", label: t("home.stats.clubs") },
    { value: "30+", label: t("home.stats.ptfa") },
  ];

  const curriculum = [
    { title: t("home.curriculum.cs.title"), desc: t("home.curriculum.cs.desc"), img: currCs },
    { title: t("home.curriculum.math.title"), desc: t("home.curriculum.math.desc"), img: currMath },
    { title: t("home.curriculum.lit.title"), desc: t("home.curriculum.lit.desc"), img: currLit },
    { title: t("home.curriculum.sci.title"), desc: t("home.curriculum.sci.desc"), img: currSci },
    { title: t("home.curriculum.arts.title"), desc: t("home.curriculum.arts.desc"), img: currArts },
    { title: t("home.curriculum.perf.title"), desc: t("home.curriculum.perf.desc"), img: currPerf },
  ];

  const activities = [
    { title: t("home.activities.sports"), img: actSports },
    { title: t("home.activities.music"), img: actMusic },
    { title: t("home.activities.arts"), img: actArts },
    { title: t("home.activities.clubs"), img: actClubs },
  ];

  useEffect(() => {
    supabase
      .from("announcements")
      .select("*")
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(3)
      .then(({ data }) => { if (data) setAnnouncements(data); });
  }, []);

  useEffect(() => {
    const tm = setTimeout(() => {
      setPrev(slide);
      setSlide((slide + 1) % slides.length);
    }, 4500);
    return () => clearTimeout(tm);
  }, [slide, slides.length]);

  const hideCopy = !!current.hasText;

  const quickLinks = [
    { to: "/admissions", label: t("home.quick.admissions", "Admissions") },
    { to: "/academics", label: t("home.quick.academics", "Academics") },
    { to: "/school-life", label: t("home.quick.life", "School Life") },
    { to: "/news", label: t("home.quick.news", "News & Events") },
    { to: "/contact", label: t("home.quick.visit", "Visit Us") },
  ];

  const eyebrow = "text-xs font-semibold uppercase tracking-[0.25em] text-primary";
  const heading = "font-heading text-3xl font-bold leading-[1.1] text-foreground md:text-5xl";

  return (
    <Layout>
      {/* HERO: full-bleed image, headline anchored bottom-left */}
      <section className="relative isolate h-[88vh] min-h-[600px] w-full overflow-hidden bg-foreground">
        {/* All slides are mounted and stacked so every image is loaded before it is shown; the incoming slide fades in over the outgoing one. */}
        {slides.map((sl, i) => {
          const active = i === slide;
          const leaving = i === prev;
          return (
            <picture
              key={i}
              aria-hidden={!active}
              className={`absolute inset-0 block h-full w-full ${
                active
                  ? "z-[2] scale-100 opacity-100 transition-[opacity,transform] duration-[1200ms,4500ms] ease-out"
                  : leaving
                    ? "z-[1] scale-100 opacity-100"
                    : "z-0 scale-105 opacity-0"
              }`}
            >
              {sl.phoneSrc && <source media="(max-width: 767px)" srcSet={sl.phoneSrc} />}
              <img
                src={sl.src}
                alt={active ? t("home.hero.title") : ""}
                loading="eager"
                decoding="async"
                fetchPriority={i === 0 ? "high" : "auto"}
                className={`h-full w-full object-cover ${sl.phoneSrc ? "object-[center_75%] md:object-[center_30%]" : "object-[center_30%]"}`}
              />
            </picture>
          );
        })}
        <div className="absolute inset-0 z-[3] bg-gradient-to-t from-black/85 via-black/50 to-black/30" />

        <div className="container relative z-10 flex h-full flex-col justify-end pb-40 md:pb-44">
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-3xl text-white">
            {/* Slides with baked-in welcome text hide the live copy (still readable by screen readers). */}
            <span className={`text-xs font-semibold uppercase tracking-[0.3em] text-white/80 ${hideCopy ? "md:sr-only" : ""}`}>Harare, Zimbabwe</span>
            <h1 className={`mt-4 font-heading text-5xl font-bold leading-[1.02] md:text-7xl lg:text-8xl ${hideCopy ? "md:sr-only" : ""}`}>
              {t("home.hero.title")}
            </h1>
            <p className={`mt-6 max-w-xl text-base leading-relaxed text-white/90 md:text-lg ${hideCopy ? "md:sr-only" : ""}`}>
              {t("home.hero.subtitle")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/admissions">
                <Button size="lg" className="rounded-none bg-primary px-8 text-primary-foreground hover:bg-primary/90">
                  {t("home.hero.cta")} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="rounded-none border-white bg-transparent px-8 text-white hover:bg-white hover:text-foreground">
                  {t("home.quick.visit", "Visit Us")}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-28 right-6 z-20 hidden gap-2 md:flex">
          {slides.map((_, i) => (
            <button key={i} onClick={() => { setPrev(slide); setSlide(i); }} aria-label={`Slide ${i + 1}`}
              className={`h-1.5 transition-all ${i === slide ? "w-10 bg-white" : "w-5 bg-white/50 hover:bg-white/80"}`} />
          ))}
        </div>
      </section>

      {/* QUICK LINKS: bar overlapping the hero */}
      <section className="relative z-30 -mt-16">
        <div className="container">
          <nav aria-label="Quick links" className="grid grid-cols-2 bg-primary text-primary-foreground shadow-2xl md:grid-cols-5">
            {quickLinks.map((q, i) => (
              <Link key={q.to} to={q.to}
                className={`group flex items-center justify-between border-b border-r border-white/15 px-6 py-6 font-heading text-lg font-semibold transition-colors hover:bg-white hover:text-primary md:border-b-0 ${i === quickLinks.length - 1 ? "col-span-2 md:col-span-1" : ""}`}>
                {q.label}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </nav>
        </div>
      </section>

      {/* INTRO */}
      <section className="py-24 md:py-32">
        <div className="container grid items-start gap-14 lg:grid-cols-12">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="lg:col-span-7">
            <span className={eyebrow}>{t("home.quick.about", "Welcome")}</span>
            <h2 className={`mt-4 ${heading} md:text-6xl`}>{t("home.learning.title")}</h2>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.1 }} className="lg:col-span-5">
            <p className="text-lg leading-relaxed text-muted-foreground">{t("home.learning.p1")}</p>
            <p className="mt-4 leading-relaxed text-muted-foreground">{t("home.learning.p2")}</p>
            <Link to="/about" className="mt-8 inline-flex items-center gap-2 border-b-2 border-primary pb-1 text-sm font-semibold uppercase tracking-widest text-primary">
              {t("home.learning.cta")} <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* STATS BAND */}
      <section className="bg-foreground py-16 text-background md:py-20">
        <div className="container grid grid-cols-2 gap-10 md:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="border-l border-white/25 pl-6">
              <div className="font-heading text-5xl font-bold text-[hsl(var(--gold))] md:text-6xl">{s.value}</div>
              <div className="mt-2 text-sm uppercase tracking-widest text-background/75">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ACADEMICS: alternating feature blocks */}
      <section className="py-24 md:py-32">
        <div className="container">
          <div className="max-w-3xl">
            <span className={eyebrow}>{t("home.quick.academics", "Academics")}</span>
            <h2 className={`mt-4 ${heading}`}>{t("home.curriculum.title")}</h2>
            <p className="mt-5 leading-relaxed text-muted-foreground">{t("home.curriculum.intro")}</p>
          </div>

          <div className="mt-16 space-y-20">
            {curriculum.slice(0, 3).map((c, i) => (
              <motion.div key={c.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
                className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
                <div className={`aspect-[3/2] overflow-hidden bg-muted ${i % 2 ? "lg:order-2" : ""}`}>
                  <img src={c.img} alt={c.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 hover:scale-105" />
                </div>
                <div>
                  <h3 className="font-heading text-3xl font-bold text-foreground md:text-4xl">{c.title}</h3>
                  <p className="mt-4 max-w-md leading-relaxed text-muted-foreground">{c.desc}</p>
                  <Link to="/academics" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-primary">
                    {t("home.learning.cta")} <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-20 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
            {curriculum.slice(3).map((c) => (
              <Link to="/academics" key={c.title} className="group relative aspect-[4/3] overflow-hidden bg-foreground">
                <img src={c.img} alt={c.title} loading="lazy" className="h-full w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <h3 className="font-heading text-2xl font-bold">{c.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-white/80">{c.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PRINCIPAL */}
      <section className="bg-muted/60 py-24 md:py-32">
        <div className="container grid items-center gap-14 lg:grid-cols-5">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="lg:col-span-2">
            <DirectorPhoto />
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="lg:col-span-3">
            <span className={eyebrow}>{t("home.director.eyebrow")}</span>
            <h2 className={`mt-4 ${heading}`}>{t("home.director.title")}</h2>
            <blockquote className="mt-8 border-l-4 border-[hsl(var(--gold))] pl-6 font-heading text-xl italic leading-relaxed text-foreground md:text-2xl">
              "{t("home.director.quote")}"
            </blockquote>
            <p className="mt-6 leading-relaxed text-muted-foreground">{t("home.director.body")}</p>
            <p className="mt-6 font-heading text-base font-semibold text-foreground">
              {t("home.director.signature")} <span className="font-normal text-muted-foreground">{t("home.director.signatureRole")}</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* SCHOOL LIFE */}
      <section className="py-24 md:py-32">
        <div className="container">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div>
              <span className={eyebrow}>{t("home.activities.eyebrow")}</span>
              <h2 className={`mt-4 ${heading}`}>{t("home.activities.title")}</h2>
            </div>
            <Link to="/school-life" className="inline-flex items-center gap-2 border-b-2 border-primary pb-1 text-sm font-semibold uppercase tracking-widest text-primary">
              {t("home.quick.life", "School Life")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {activities.map((a, i) => (
              <motion.div key={a.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="group relative aspect-[3/4] overflow-hidden">
                <img src={a.img} alt={a.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <h3 className="absolute inset-x-0 bottom-0 p-5 font-heading text-2xl font-semibold text-white">{a.title}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWS */}
      {announcements.length > 0 && (
        <section className="bg-muted/60 py-24 md:py-32">
          <div className="container">
            <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
              <div>
                <span className={eyebrow}>{t("home.news.eyebrow")}</span>
                <h2 className={`mt-4 ${heading}`}>{t("home.news.title")}</h2>
              </div>
              <Link to="/news" className="inline-flex items-center gap-2 border-b-2 border-primary pb-1 text-sm font-semibold uppercase tracking-widest text-primary">
                {t("home.quick.news", "News & Events")} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-px bg-border md:grid-cols-3">
              {announcements.map((a, i) => (
                <motion.article key={a.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                  className="bg-card p-8">
                  <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                    {new Date(a.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  <h3 className="mt-4 font-heading text-2xl font-bold leading-snug text-foreground">{a.title}</h3>
                  {a.content && <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-muted-foreground">{a.content}</p>}
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="relative isolate overflow-hidden py-28 text-white md:py-36">
        <img src={hero3} alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-primary/85" />
        <div className="container text-center">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mx-auto max-w-3xl font-heading text-4xl font-bold leading-tight md:text-6xl">
            {t("home.cta.title")}
          </motion.h2>
          <p className="mx-auto mt-6 max-w-2xl leading-relaxed text-white/85">{t("home.cta.desc")}</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link to="/admissions">
              <Button size="lg" className="rounded-none bg-white px-8 text-primary hover:bg-white/90">
                {t("home.cta.button")} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="rounded-none border-white bg-transparent px-8 text-white hover:bg-white hover:text-primary">
                {t("home.quick.visit", "Visit Us")}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}

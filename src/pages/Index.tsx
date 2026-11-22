import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import StoneOpening from "@/components/masonry/StoneOpening";
import { focus, type Focus } from "@/lib/photoFocus";
import hero1 from "@/assets/hero-students-1.jpg";
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

type Announcement = { id: string; title: string; content: string | null; created_at: string };

/** A block in a masonry course: the picture, and a small slab of stone carrying its name. */
function StoneBlock({ to, img, title, desc, className, pos }: { to: string; img: string; title: string; desc?: string; className: string; pos: Focus }) {
  return (
    <Link to={to} className={`group relative block overflow-hidden bg-shadow ${className}`}>
      <img
        src={img}
        alt=""
        loading="lazy"
        style={{ objectPosition: pos.d }}
        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none"
      />
      <div className="slab absolute bottom-0 left-0 max-w-[88%] px-4 py-3 sm:px-5 sm:py-4">
        <h3 className="font-heading text-lg font-bold leading-tight text-foreground sm:text-xl">{title}</h3>
        {desc && <p className="mt-1 line-clamp-2 text-sm leading-snug text-muted-foreground">{desc}</p>}
      </div>
    </Link>
  );
}

const textLink =
  "inline-flex items-center gap-2 border-b-2 border-ochre pb-0.5 text-sm font-bold tracking-wide text-foreground transition-colors hover:border-primary hover:text-primary";

export default function Home() {
  const { t } = useTranslation();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from("announcements")
          .select("*")
          .eq("is_public", true)
          .order("created_at", { ascending: false })
          .limit(3);
        if (data) setAnnouncements(data);
      } catch {
        setAnnouncements([]);
      }
    })();
  }, []);

  const gateways = [
    { to: "/admissions", label: t("home.cta.button"), tone: "bg-primary text-primary-foreground hover:bg-navy" },
    { to: "/contact", label: t("home.quick.visit", "Visit Us"), tone: "bg-raised text-foreground hover:bg-accent" },
    { to: "/pay-online", label: t("fees.payOnline"), tone: "bg-raised text-foreground hover:bg-accent" },
    { to: "/login", label: t("nav.portalLogin"), tone: "bg-navy text-lit hover:bg-primary" },
  ];

  const stats = [
    { value: "800+", label: t("home.stats.enrollments") },
    { value: "45+", label: t("home.stats.staff") },
    { value: "24+", label: t("home.stats.clubs") },
    { value: "30+", label: t("home.stats.ptfa") },
  ];

  const curriculum = [
    { title: t("home.curriculum.cs.title"), desc: t("home.curriculum.cs.desc"), img: currCs, pos: focus.currCs, span: "lg:col-span-5" },
    { title: t("home.curriculum.math.title"), desc: t("home.curriculum.math.desc"), img: currMath, pos: focus.currMath, span: "lg:col-span-4" },
    { title: t("home.curriculum.lit.title"), desc: t("home.curriculum.lit.desc"), img: currLit, pos: focus.currLit, span: "lg:col-span-3" },
    { title: t("home.curriculum.sci.title"), desc: t("home.curriculum.sci.desc"), img: currSci, pos: focus.currSci, span: "lg:col-span-3" },
    { title: t("home.curriculum.arts.title"), desc: t("home.curriculum.arts.desc"), img: currArts, pos: focus.currArts, span: "lg:col-span-4" },
    { title: t("home.curriculum.perf.title"), desc: t("home.curriculum.perf.desc"), img: currPerf, pos: focus.currPerf, span: "lg:col-span-5" },
  ];

  const activities = [
    { title: t("home.activities.sports"), img: actSports, pos: focus.actSports, span: "lg:col-span-7" },
    { title: t("home.activities.music"), img: actMusic, pos: focus.actMusic, span: "lg:col-span-5" },
    { title: t("home.activities.arts"), img: actArts, pos: focus.actArts, span: "lg:col-span-5" },
    { title: t("home.activities.clubs"), img: actClubs, pos: focus.actClubs, span: "lg:col-span-7" },
  ];

  return (
    <Layout>
      {/* THE OPENING: the school photograph set into the wall like a window, the name on a lintel, four gateways at the foot */}
      <section className="granite bg-shadow">
        <StoneOpening
          src={hero1}
          alt={t("home.hero.title")}
          focus={focus.heroStudents1}
          seed={7}
          photoClassName="h-[300px] sm:h-[44vh] sm:min-h-[380px] lg:h-[clamp(380px,46vh,560px)]"
          sill="h-3 sm:h-4"
        >
          <div className="relative z-10 mx-auto bg-navy px-5 py-6 text-lit shadow-[0_18px_40px_-18px_hsl(220_25%_6%/0.75)] sm:-mt-14 sm:w-[calc(100%-4rem)] sm:max-w-[1336px] sm:px-8 sm:py-8 lg:grid lg:grid-cols-12 lg:items-end lg:gap-10 lg:px-12 lg:py-10">
            <h1 className="text-4xl font-extrabold leading-[1.04] sm:text-5xl lg:col-span-8 xl:text-6xl">{t("home.hero.title")}</h1>
            <div className="mt-4 lg:col-span-4 lg:mt-0">
              <p className="max-w-[34rem] text-base leading-relaxed text-lit/85 md:text-lg">{t("home.hero.subtitle")}</p>
              <p className="mt-3 text-sm font-bold tracking-wide text-ochre">{t("home.hero.location", "Harare, Zimbabwe")}</p>
            </div>
          </div>
        </StoneOpening>

        <nav aria-label={t("nav.menu")} className="grid grid-cols-2 gap-[5px] bg-shadow p-[5px] lg:grid-cols-4">
          {gateways.map((g) => (
            <Link
              key={g.to}
              to={g.to}
              className={`group flex min-h-[4.75rem] items-end justify-between gap-3 border-t-[6px] border-ochre px-4 py-4 font-heading text-lg font-bold leading-tight transition-colors duration-150 sm:px-6 sm:py-5 sm:text-xl lg:min-h-[7rem] lg:text-2xl ${g.tone}`}
            >
              {g.label}
              <ArrowUpRight className="h-5 w-5 shrink-0 transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 lg:h-6 lg:w-6" />
            </Link>
          ))}
        </nav>
      </section>

      <div className="chevron-band chevron-band-lg" aria-hidden="true" />

      {/* INTRO */}
      <section className="py-20 md:py-28">
        <div className="container grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-6">
            <h2 className="text-4xl font-extrabold leading-[1.02] text-foreground sm:text-5xl lg:text-7xl">{t("home.learning.title")}</h2>
            <dl className="tabular mt-12 max-w-lg border-t-2 border-foreground lg:mt-16">
              {stats.map((s) => (
                <div key={s.label} className="flex items-baseline justify-between gap-4 border-b border-border py-3.5">
                  <dt className="text-sm font-medium text-muted-foreground">{s.label}</dt>
                  <dd className="font-heading text-3xl font-extrabold text-foreground">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="lg:col-span-5 lg:col-start-8 lg:pt-3">
            <p className="max-w-prose text-lg leading-relaxed text-foreground md:text-xl">{t("home.learning.p1")}</p>
            <p className="mt-5 max-w-prose leading-relaxed text-muted-foreground">{t("home.learning.p2")}</p>
            <Link to="/about" className={`mt-8 ${textLink}`}>
              {t("home.learning.cta")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ACADEMICS: six blocks in two courses */}
      <section className="pb-20 md:pb-28">
        <div className="container">
          <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-extrabold leading-[1.05] text-foreground sm:text-4xl lg:text-5xl">{t("home.curriculum.title")}</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">{t("home.curriculum.intro")}</p>
            </div>
            <Link to="/academics" className={textLink}>
              {t("home.hero.cta")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-[5px] bg-shadow p-[5px] sm:grid-cols-2 lg:grid-cols-12">
          {curriculum.map((c) => (
            <StoneBlock key={c.title} to="/academics" img={c.img} title={c.title} desc={c.desc} pos={c.pos} className={`h-72 lg:h-[26rem] ${c.span}`} />
          ))}
        </div>
      </section>

      {/* PRINCIPAL */}
      <section className="granite bg-shadow py-20 text-lit md:py-28">
        <div className="container grid items-start gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <div className="border-x-[10px] border-b-[10px] border-lit bg-lit">
              <img src={principalPhoto} alt="Mr. F.J. Moyo, Principal" loading="lazy" className="aspect-[4/5] w-full object-cover object-top" />
            </div>
            <div className="slab -mt-3 ml-6 inline-block px-4 py-3 text-foreground">
              <p className="font-heading text-lg font-bold leading-tight">{t("home.director.signature")}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{t("home.director.signatureRole")}</p>
            </div>
          </div>
          <div className="lg:col-span-8 lg:pt-2">
            <h2 className="sr-only">{t("home.director.title")}</h2>
            <blockquote className="font-heading text-2xl font-semibold leading-[1.25] text-lit sm:text-3xl lg:text-4xl">
              “{t("home.director.quote")}”
            </blockquote>
            <p className="mt-8 max-w-prose leading-relaxed text-lit/80">{t("home.director.body")}</p>
          </div>
        </div>
      </section>
      <div className="chevron-band chevron-band-lg chevron-band-shadow bg-shadow" aria-hidden="true" />

      {/* SCHOOL LIFE */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
            <h2 className="max-w-2xl text-3xl font-extrabold leading-[1.05] text-foreground sm:text-4xl lg:text-5xl">{t("home.activities.title")}</h2>
            <Link to="/school-life" className={textLink}>
              {t("home.quick.life", "School Life")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-[5px] bg-shadow p-[5px] sm:grid-cols-2 lg:grid-cols-12">
          {activities.map((a) => (
            <StoneBlock key={a.title} to="/school-life" img={a.img} title={a.title} pos={a.pos} className={`h-80 lg:h-[32rem] ${a.span}`} />
          ))}
        </div>
      </section>

      {/* NEWS: only when the school has published something */}
      {announcements.length > 0 && (
        <section className="pb-20 md:pb-28">
          <div className="container">
            <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
              <h2 className="max-w-2xl text-3xl font-extrabold leading-[1.05] text-foreground sm:text-4xl lg:text-5xl">{t("home.news.title")}</h2>
              <Link to="/news" className={textLink}>
                {t("home.quick.news", "News & Events")} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {announcements.map((a) => (
                <article key={a.id} className="slab flex flex-col p-6 md:p-7">
                  <time className="tabular text-sm font-bold text-primary" dateTime={a.created_at}>
                    {new Date(a.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </time>
                  <h3 className="mt-3 text-xl font-bold leading-snug text-foreground">{a.title}</h3>
                  {a.content && <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-muted-foreground">{a.content}</p>}
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* THE DOORWAY: the last gateway, with the answer to "what do I do next" */}
      <section className="relative bg-navy text-lit">
        <div className="chevron-band chevron-band-lg" aria-hidden="true" />
        <div className="container grid items-center gap-12 py-20 md:py-28 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <h2 className="max-w-3xl text-4xl font-extrabold leading-[1.03] sm:text-5xl lg:text-6xl">{t("home.cta.title")}</h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-lit/85">{t("home.cta.desc")}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link to="/admissions">
                <Button size="lg" className="bg-lit text-navy shadow-none hover:bg-ochre-soft">
                  {t("home.cta.button")} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="border-lit/70 text-lit hover:border-lit hover:bg-lit hover:text-navy">
                  {t("home.quick.visit", "Visit Us")}
                </Button>
              </Link>
            </div>
          </div>
          <div className="mx-auto w-full max-w-sm lg:col-span-5 lg:max-w-md">
            <div className="slab -mx-4 h-5 sm:-mx-6" aria-hidden="true" />
            <div className="border-x-[14px] border-b-[14px] border-lit bg-shadow">
              <img src={hero5} alt="" loading="lazy" className="aspect-[3/4] w-full object-cover [object-position:17%_50%]" />
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

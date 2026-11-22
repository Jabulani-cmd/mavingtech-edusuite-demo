import { useTranslation } from "react-i18next";
import Layout from "@/components/layout/Layout";
import PageHero from "@/components/layout/PageHero";
import { Users, Award, Globe } from "lucide-react";
import hero from "@/assets/hero-students-2.jpg";
import { focus } from "@/lib/photoFocus";

const alumni = [
  { name: "Dr. Tinashe Mutasa", role: "Surgeon, Parirenyatwa Group of Hospitals", year: "Class of 1998" },
  { name: "Nokuthula Ndlovu", role: "Software Engineer, Google", year: "Class of 2005" },
  { name: "Mandla Khumalo", role: "Diplomat, United Nations", year: "Class of 2001" },
];

export default function About() {
  const { t } = useTranslation();
  const stats = [
    { icon: Users, value: "800+", label: t("about.stats.students") },
    { icon: Award, value: "95%", label: t("about.stats.passRate") },
    { icon: Globe, value: "10,000+", label: t("about.stats.alumni") },
  ];
  const values = [
    { title: t("about.values.excellence.title"), desc: t("about.values.excellence.desc") },
    { title: t("about.values.integrity.title"), desc: t("about.values.integrity.desc") },
    { title: t("about.values.innovation.title"), desc: t("about.values.innovation.desc") },
  ];

  return (
    <Layout>
      <PageHero eyebrow={t("about.eyebrow")} title={t("about.title")} subtitle={t("about.subtitle")} image={hero} focus={focus.heroStudents2} />

      <section className="py-20 md:py-28">
        <div className="container grid items-start gap-14 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <h2 className="mt-4 font-heading text-3xl font-bold leading-tight text-foreground md:text-5xl">{t("about.historyTitle")}</h2>
          </div>
          <div className="lg:col-span-3 space-y-5 leading-relaxed text-muted-foreground">
            <p>{t("about.history1")}</p>
            <p>{t("about.history2")}</p>
            <p>{t("about.history3")}</p>
          </div>
        </div>
      </section>

      <section className="bg-ochre-soft py-16 md:py-20">
        <div className="container grid grid-cols-1 gap-8 sm:grid-cols-3">
          {stats.map((s, i) => (
            <div key={i} className="border-t-2 border-foreground pt-5">
              <s.icon className="mb-3 h-7 w-7 text-primary" />
              <div className="font-heading text-4xl font-bold text-primary md:text-5xl">{s.value}</div>
              <div className="mt-2 text-sm font-medium text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container">
          <div className="mb-12">
            <h2 className="mt-3 font-heading text-3xl font-bold text-foreground md:text-5xl">{t("about.values.title")}</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {values.map((v, i) => (
              <div key={i}
                className="bg-card p-8 border border-border">
                <h3 className="font-heading text-xl font-bold text-foreground">{v.title}</h3>
                <p className="mt-4 leading-relaxed text-muted-foreground">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted/40 py-20 md:py-28">
        <div className="container">
          <div className="mb-12">
            <h2 className="mt-3 font-heading text-3xl font-bold text-foreground md:text-5xl">{t("about.alumni.title")}</h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {alumni.map((a, i) => (
              <div key={a.name}
                className="overflow-hidden bg-card p-6 border border-border">
                <div className="mb-4 flex h-14 w-14 items-center justify-center bg-primary/10 font-heading text-2xl font-bold text-primary">
                  {a.name[0]}
                </div>
                <h3 className="font-heading text-lg font-bold text-foreground">{a.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{a.role}</p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-primary">{a.year}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}

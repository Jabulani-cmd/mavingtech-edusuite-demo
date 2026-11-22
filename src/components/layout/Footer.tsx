import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import schoolLogo from "@/assets/mavingtech-logo.png";
import ministryLogo from "@/assets/ministry-of-education-logo.png";
import zimsecLogo from "@/assets/zimsec-logo.png";
import cambridgeLogo from "@/assets/cambridge-logo.png";
import { SCHOOL_ADDRESS, SCHOOL_EMAIL, SCHOOL_PHONE, SCHOOL_PHONE_LINK } from "@/lib/school";
import InstallAppButton from "@/components/pwa/InstallAppButton";

const footLink = "inline-block py-1.5 transition-colors hover:text-ochre";
const social =
  "flex h-11 w-11 items-center justify-center border border-white/25 transition-colors hover:border-ochre hover:text-ochre";

export default function Footer() {
  const { t } = useTranslation();
  const affiliations = [
    { logo: ministryLogo, alt: "Coat of arms of Zimbabwe", name: t("footer.moe") },
    { logo: zimsecLogo, alt: "ZIMSEC logo", name: "Zimbabwe School Examinations Council" },
    { logo: cambridgeLogo, alt: "University of Cambridge logo", name: "Cambridge International Education" },
  ];

  return (
    <footer className="granite bg-[hsl(var(--footer-bg))] text-[hsl(var(--footer-fg))]">
      {/* Affiliations: three slabs set in one course */}
      <div className="bg-shadow">
        <div className="grid grid-cols-1 gap-[5px] bg-shadow p-[5px] sm:grid-cols-3">
          {affiliations.map((a) => (
            <div key={a.name} className="flex items-center gap-5 bg-lit px-6 py-6 text-shadow sm:flex-col sm:items-start sm:gap-4 lg:flex-row lg:items-center">
              <img src={a.logo} alt={a.alt} className="h-20 w-20 shrink-0 object-contain" />
              <span className="text-sm font-semibold leading-snug">{a.name}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="chevron-band chevron-band-lg" aria-hidden="true" />

      <div className="container py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-5 inline-block bg-lit px-4 py-3">
              <img src={schoolLogo} alt="MavingTech" className="h-auto w-28 object-contain" />
            </div>
            <p className="font-heading text-xl font-bold">{t("brand.schoolName")}</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/75">{t("footer.description")}</p>
            <div className="mt-6 flex items-center gap-2">
              <a href="https://wa.me/263242550123" aria-label="WhatsApp" className={social}><MessageCircle className="h-4 w-4" /></a>
            </div>
          </div>

          <div>
            <h4 className="mb-3 font-heading text-base font-bold text-ochre">{t("footer.quickLinks")}</h4>
            <ul className="text-sm text-white/80">
              <li><Link to="/about" className={footLink}>{t("footer.aboutUs")}</Link></li>
              <li><Link to="/academics" className={footLink}>{t("nav.academics")}</Link></li>
              <li><Link to="/admissions" className={footLink}>{t("nav.admissions")}</Link></li>
              <li><Link to="/school-life" className={footLink}>{t("nav.schoolLife")}</Link></li>
              <li><Link to="/news" className={footLink}>{t("nav.news")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-heading text-base font-bold text-ochre">{t("footer.programs")}</h4>
            <ul className="text-sm text-white/80">
              <li><Link to="/sports-culture" className={footLink}>{t("nav.sportsCulture")}</Link></li>
              <li><Link to="/awards" className={footLink}>{t("nav.awards")}</Link></li>
              <li><Link to="/facilities" className={footLink}>{t("nav.facilities")}</Link></li>
              <li><Link to="/boarding" className={footLink}>{t("nav.boarding")}</Link></li>
              <li><Link to="/fees" className={footLink}>{t("nav.fees")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-heading text-base font-bold text-ochre">{t("footer.contact")}</h4>
            <ul className="space-y-1 text-sm text-white/80">
              <li className="flex items-start gap-3 py-1.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ochre" />
                <span>{SCHOOL_ADDRESS}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-ochre" />
                <a href={SCHOOL_PHONE_LINK} className={footLink}>{SCHOOL_PHONE}</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-ochre" />
                <a href={`mailto:${SCHOOL_EMAIL}`} className={footLink}>{SCHOOL_EMAIL}</a>
              </li>
              <li>
                <InstallAppButton className="inline-flex items-center gap-3 py-1.5 transition-colors hover:text-ochre" />
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 border-t border-white/15 pt-6 text-xs text-white/65">
          <p>© {new Date().getFullYear()} {t("brand.schoolName")}. {t("footer.rights")}</p>
        </div>
      </div>
    </footer>
  );
}

import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Twitter, Facebook, Instagram } from "lucide-react";
import schoolLogo from "@/assets/mavingtech-logo.png";
import moeLogo from "@/assets/ministry-of-education-logo.png";
import cambridgeLogo from "@/assets/cambridge-logo.png";
import zimsecLogo from "@/assets/zimsec-logo.png";

export default function Footer() {
  return (
    <footer className="bg-[hsl(var(--footer-bg))] text-[hsl(var(--footer-fg))]">
      {/* Affiliations strip on white */}
      <div className="bg-background py-10 border-t border-border">
        <div className="container">
          <p className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Affiliated With
          </p>
          <div className="flex flex-wrap items-center justify-center gap-10 opacity-80">
            <div className="flex flex-col items-center gap-1">
              <img src={cambridgeLogo} alt="Cambridge" className="h-16 w-16 object-contain" />
              <span className="text-[10px] text-muted-foreground">Cambridge</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <img src={moeLogo} alt="Ministry of Education" className="h-14 w-14 object-contain" />
              <span className="max-w-[140px] text-center text-[10px] leading-tight text-muted-foreground">
                Ministry of Primary &amp; Secondary Education
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <img src={zimsecLogo} alt="ZIMSEC" className="h-16 w-16 object-contain" />
              <span className="text-[10px] text-muted-foreground">ZIMSEC</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <img src={schoolLogo} alt="MavingTech" className="h-12 w-12 object-contain" />
              <span className="font-heading text-xl font-bold">MavingTech</span>
            </div>
            <p className="text-sm leading-relaxed text-white/70">
              We are an early learning academy focused on social-emotional development and early literacy and numeracy. Our students walk out with the character and confidence to make their mark.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a href="#" aria-label="Twitter" className="rounded-full border border-white/20 p-2 transition-colors hover:border-primary hover:text-primary">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" aria-label="Facebook" className="rounded-full border border-white/20 p-2 transition-colors hover:border-primary hover:text-primary">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" aria-label="Instagram" className="rounded-full border border-white/20 p-2 transition-colors hover:border-primary hover:text-primary">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-heading text-base font-semibold">Quick Links</h4>
            <ul className="space-y-2.5 text-sm text-white/70">
              <li><Link to="/about" className="transition-colors hover:text-primary">About Us</Link></li>
              <li><Link to="/academics" className="transition-colors hover:text-primary">Academics</Link></li>
              <li><Link to="/admissions" className="transition-colors hover:text-primary">Admissions</Link></li>
              <li><Link to="/school-life" className="transition-colors hover:text-primary">School Life</Link></li>
              <li><Link to="/news" className="transition-colors hover:text-primary">News</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-heading text-base font-semibold">Programs</h4>
            <ul className="space-y-2.5 text-sm text-white/70">
              <li><Link to="/sports-culture" className="transition-colors hover:text-primary">Sports &amp; Culture</Link></li>
              <li><Link to="/awards" className="transition-colors hover:text-primary">Awards</Link></li>
              <li><Link to="/facilities" className="transition-colors hover:text-primary">Facilities</Link></li>
              <li><Link to="/boarding" className="transition-colors hover:text-primary">Boarding</Link></li>
              <li><Link to="/fees" className="transition-colors hover:text-primary">Fees</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-heading text-base font-semibold">Contact</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                <span>Bulawayo, Zimbabwe</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                <span>+263 29 XXXXXXX</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                <span>info@mavingtech.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-center text-xs text-white/50">
          <p>© {new Date().getFullYear()} MavingTech High School. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import schoolLogo from "@/assets/school-logo.png";

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <img src={schoolLogo} alt="Gifford High School crest" className="h-32 w-32 object-contain" />
              <span className="font-heading text-xl font-bold">Gifford High School</span>
            </div>
            <p className="text-xs italic text-primary-foreground/70">Hinc Orior — From Here I Arise</p>
            <p className="mt-1 text-sm text-primary-foreground/80">
              Nurturing excellence in education, sports, and character since 1927.
            </p>
          </div>

          <div>
            <h4 className="mb-3 font-heading text-sm font-semibold uppercase tracking-wider text-secondary">Quick Links</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li><Link to="/about" className="hover:text-secondary transition-colors">About Us</Link></li>
              <li><Link to="/academics" className="hover:text-secondary transition-colors">Academics</Link></li>
              <li><Link to="/admissions" className="hover:text-secondary transition-colors">Admissions</Link></li>
              <li><Link to="/school-life" className="hover:text-secondary transition-colors">School Life</Link></li>
              <li><Link to="/fees" className="hover:text-secondary transition-colors">Fees</Link></li>
              <li><Link to="/school-projects" className="hover:text-secondary transition-colors">School Projects</Link></li>
              <li><Link to="/vacancies" className="hover:text-secondary transition-colors">Vacancies</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-heading text-sm font-semibold uppercase tracking-wider text-secondary">Portals</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li><Link to="/login" className="hover:text-secondary transition-colors">Student Portal</Link></li>
              <li><Link to="/login" className="hover:text-secondary transition-colors">Parent/Teacher Portal</Link></li>
              <li><Link to="/login" className="hover:text-secondary transition-colors">Admin Portal</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-heading text-sm font-semibold uppercase tracking-wider text-secondary">Contact</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0" /> Bulawayo, Zimbabwe</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 shrink-0" /> +263 29 XXXXXXX</li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 shrink-0" /> info@giffordhigh.ac.zw</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-primary-foreground/20 pt-6 text-center text-xs text-primary-foreground/60">
          <p>© {new Date().getFullYear()} Gifford High School. All rights reserved.</p>
          <p className="mt-2">
            This website was designed and is maintained by{" "}
            <a href="https://mavingtech.com" target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline">
              MavingTech Business Solutions
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

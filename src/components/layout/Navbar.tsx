import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import schoolLogo from "@/assets/school-logo.png";
import zimbabweFlag from "@/assets/zimbabwe-flag.jpg";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface NavItem {
  label: string;
  path: string;
  children?: { label: string; path: string }[];
}

const navLinks: NavItem[] = [
  { label: "Home", path: "/" },
  {
    label: "About",
    path: "/about",
    children: [
      { label: "News", path: "/news" },
      { label: "School Projects", path: "/school-projects" },
      { label: "Facilities", path: "/facilities" },
      { label: "Boarding", path: "/boarding" },
    ],
  },
  {
    label: "Academics",
    path: "/academics",
    children: [
      { label: "Downloads", path: "/downloads" },
    ],
  },
  {
    label: "Admissions",
    path: "/admissions",
    children: [
      { label: "Fees", path: "/fees" },
    ],
  },
  {
    label: "Sports & Culture",
    path: "/sports-culture",
    children: [
      { label: "School Life", path: "/school-life" },
      { label: "Awards & Prize-Giving", path: "/awards" },
    ],
  },
  {
    label: "Staff",
    path: "/staff",
    children: [
      { label: "Vacancies", path: "/vacancies" },
    ],
  },
  { label: "Alumni", path: "/alumni" },
  { label: "Contact Us", path: "/contact" },
];

function DesktopDropdown({ item }: { item: NavItem }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const timeout = useRef<ReturnType<typeof setTimeout>>();

  const isActive = location.pathname === item.path ||
    item.children?.some((c) => location.pathname === c.path);

  const handleEnter = () => {
    clearTimeout(timeout.current);
    setOpen(true);
  };
  const handleLeave = () => {
    timeout.current = setTimeout(() => setOpen(false), 150);
  };

  useEffect(() => () => clearTimeout(timeout.current), []);

  return (
    <div ref={ref} className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <Link
        to={item.path}
        className={`flex items-center gap-1 px-3 py-2 text-xs font-semibold uppercase tracking-widest transition-colors hover:text-secondary ${
          isActive ? "text-white" : "text-white/80"
        }`}
      >
        {item.label}
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </Link>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full z-50 mt-1 min-w-[180px] rounded-md border border-border bg-popover p-1 shadow-lg"
          >
            {item.children!.map((child) => (
              <Link
                key={child.path}
                to={child.path}
                onClick={() => setOpen(false)}
                className={`block rounded-sm px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
                  location.pathname === child.path ? "font-semibold text-foreground" : "text-muted-foreground"
                }`}
              >
                {child.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MobileAccordion({ item, onClose }: { item: NavItem; onClose: () => void }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <div>
      <div className="flex items-center">
        <Link
          to={item.path}
          onClick={onClose}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-primary-foreground/10 ${
            location.pathname === item.path ? "text-primary-foreground font-semibold" : "text-primary-foreground/70"
          }`}
        >
          {item.label}
        </Link>
        <button
          onClick={() => setOpen(!open)}
          className="rounded-md p-2 text-primary-foreground/70 hover:bg-primary-foreground/10"
          aria-label={`Expand ${item.label}`}
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden pl-4"
          >
            {item.children!.map((child) => (
              <Link
                key={child.path}
                to={child.path}
                onClick={onClose}
                className={`block rounded-md px-3 py-2 text-sm transition-colors hover:bg-primary-foreground/10 ${
                  location.pathname === child.path ? "text-primary-foreground font-semibold" : "text-primary-foreground/70"
                }`}
              >
                {child.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // On homepage: transparent overlay navbar that becomes solid on scroll
  // On other pages: always solid black
  const navBg = !isHome || scrolled
    ? "bg-primary shadow-lg"
    : "bg-gradient-to-b from-black/70 to-transparent";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}>
      {/* Top utility bar — only visible on non-home or scrolled */}

      <div className="container flex items-center justify-between py-2 pr-2 md:py-4">
        <Link to="/" className="flex items-center gap-2 md:gap-3 min-w-0 flex-shrink-0">
          <img
            src={schoolLogo}
            alt="MavingTech Business Solutions crest"
            className="h-16 w-16 flex-shrink-0 object-contain md:h-20 md:w-20 lg:h-28 lg:w-28"
          />
          <div className="flex flex-col justify-center leading-tight">
            <span className="block font-heading text-lg font-bold tracking-tight text-white md:text-xl lg:text-2xl whitespace-nowrap">
              MavingTech Business Solutions
            </span>
            <span className="block text-[10px] italic text-white/60 md:text-xs lg:text-sm">
              Empowering Your Business Through Technology
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-0 lg:flex">
          {navLinks.map((item) =>
            item.children ? (
              <DesktopDropdown key={item.path} item={item} />
            ) : (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 text-xs font-semibold uppercase tracking-widest transition-colors hover:text-secondary ${
                  location.pathname === item.path ? "text-white" : "text-white/80"
                }`}
              >
                {item.label}
              </Link>
            )
          )}
          <Link to="/login">
            <Button size="sm" className="ml-3 bg-secondary text-secondary-foreground hover:bg-secondary/90 text-xs uppercase tracking-wider font-semibold">
              Portal Login
            </Button>
          </Link>
        </div>

        <div className="ml-2 flex flex-shrink-0 items-center gap-2">
          <img
            src={zimbabweFlag}
            alt="Flag of Zimbabwe"
            className="h-6 w-10 rounded object-cover shadow-md sm:h-7 sm:w-12 lg:h-8 lg:w-14"
          />

          {/* Mobile toggle */}
          <button
            className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-secondary-foreground shadow-sm transition-colors hover:bg-secondary/90 lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/10 bg-primary lg:hidden"
          >
            <div className="container flex flex-col gap-1 py-4">
              {navLinks.map((item) =>
                item.children ? (
                  <MobileAccordion key={item.path} item={item} onClose={() => setMobileOpen(false)} />
                ) : (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-primary-foreground/10 ${
                      location.pathname === item.path ? "text-primary-foreground font-semibold" : "text-primary-foreground/70"
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              )}
              <Link to="/login" onClick={() => setMobileOpen(false)}>
                <Button size="sm" className="mt-2 w-full bg-secondary text-secondary-foreground hover:bg-secondary/90">Portal Login</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

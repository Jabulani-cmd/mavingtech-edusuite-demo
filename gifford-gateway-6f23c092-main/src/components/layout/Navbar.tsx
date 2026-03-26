import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import schoolLogo from "@/assets/school-logo.png";
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
  { label: "Boarding", path: "/boarding" },
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
        className={`flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-primary-foreground/10 ${
          isActive ? "text-primary-foreground font-semibold" : "text-primary-foreground/70"
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
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 border-b border-primary/10 bg-primary text-primary-foreground backdrop-blur">
      <div className="container flex h-28 items-center justify-between md:h-36">
        <Link to="/" className="flex items-center gap-3">
          <img src={schoolLogo} alt="Gifford High School crest" className="h-[104px] w-[104px] flex-shrink-0 object-contain md:h-[120px] md:w-[120px]" />
          <div className="flex flex-col justify-center leading-tight">
            <span className="block font-heading text-2xl font-bold tracking-tight text-primary-foreground md:text-3xl md:whitespace-nowrap">Gifford High School</span>
            <span className="block text-xs italic text-primary-foreground/70 md:text-sm">Hinc Orior — From Here I Arise</span>
          </div>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-0.5 lg:flex">
          {navLinks.map((item) =>
            item.children ? (
              <DesktopDropdown key={item.path} item={item} />
            ) : (
              <Link
                key={item.path}
                to={item.path}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-primary-foreground/10 ${
                  location.pathname === item.path ? "text-primary-foreground font-semibold" : "text-primary-foreground/70"
                }`}
              >
                {item.label}
              </Link>
            )
          )}
          <Link to="/login">
            <Button size="sm" className="ml-2 bg-secondary text-secondary-foreground hover:bg-secondary/90">Portal Login</Button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button className="text-primary-foreground lg:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-primary-foreground/10 bg-primary lg:hidden"
          >
            <div className="container flex flex-col gap-1 py-4">
              {navLinks.map((item) =>
                item.children ? (
                  <MobileAccordion key={item.path} item={item} onClose={() => setOpen(false)} />
                ) : (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setOpen(false)}
                    className={`rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-primary-foreground/10 ${
                      location.pathname === item.path ? "text-primary-foreground font-semibold" : "text-primary-foreground/70"
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              )}
              <Link to="/login" onClick={() => setOpen(false)}>
                <Button size="sm" className="mt-2 w-full bg-secondary text-secondary-foreground hover:bg-secondary/90">Portal Login</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

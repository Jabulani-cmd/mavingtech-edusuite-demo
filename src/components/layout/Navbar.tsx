import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import schoolLogo from "@/assets/mavingtech-logo.png";
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
    children: [{ label: "Downloads", path: "/downloads" }],
  },
  {
    label: "Admissions",
    path: "/admissions",
    children: [{ label: "Fees", path: "/fees" }],
  },
  {
    label: "Activities",
    path: "/sports-culture",
    children: [
      { label: "School Life", path: "/school-life" },
      { label: "Awards & Prize-Giving", path: "/awards" },
    ],
  },
  {
    label: "Staff",
    path: "/staff",
    children: [{ label: "Vacancies", path: "/vacancies" }],
  },
  { label: "Alumni", path: "/alumni" },
  { label: "Contact", path: "/contact" },
];

function DesktopDropdown({ item }: { item: NavItem }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const timeout = useRef<ReturnType<typeof setTimeout>>();

  const isActive =
    location.pathname === item.path ||
    item.children?.some((c) => location.pathname === c.path);

  return (
    <div
      className="relative"
      onMouseEnter={() => {
        clearTimeout(timeout.current);
        setOpen(true);
      }}
      onMouseLeave={() => {
        timeout.current = setTimeout(() => setOpen(false), 150);
      }}
    >
      <Link
        to={item.path}
        className={`flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors hover:text-primary ${
          isActive ? "text-primary" : "text-foreground/80"
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
            className="absolute left-0 top-full z-50 mt-1 min-w-[200px] rounded-md border border-border bg-popover p-1 shadow-lg"
          >
            {item.children!.map((child) => (
              <Link
                key={child.path}
                to={child.path}
                onClick={() => setOpen(false)}
                className={`block rounded-sm px-3 py-2 text-sm transition-colors hover:bg-muted hover:text-primary ${
                  location.pathname === child.path ? "font-semibold text-primary" : "text-foreground/80"
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
    <div className="border-b border-border/60">
      <div className="flex items-center">
        <Link
          to={item.path}
          onClick={onClose}
          className={`flex-1 px-3 py-3 text-sm font-medium ${
            location.pathname === item.path ? "text-primary" : "text-foreground"
          }`}
        >
          {item.label}
        </Link>
        <button
          onClick={() => setOpen(!open)}
          className="p-3 text-foreground/60 hover:text-primary"
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
            className="overflow-hidden bg-muted/40 pl-4"
          >
            {item.children!.map((child) => (
              <Link
                key={child.path}
                to={child.path}
                onClick={onClose}
                className={`block px-3 py-2.5 text-sm ${
                  location.pathname === child.path ? "font-semibold text-primary" : "text-foreground/70"
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
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex items-center justify-between py-3">
        {/* Logo left */}
        <Link to="/" className="flex items-center gap-4 min-w-0 flex-shrink-0">
          <img
            src={schoolLogo}
            alt="MavingTech High School"
            className="h-[7.5rem] w-[7.5rem] flex-shrink-0 object-contain md:h-[9rem] md:w-[9rem]"
          />
          <div className="hidden flex-col leading-tight sm:flex">
            <span className="font-heading text-xl font-bold text-foreground md:text-2xl">
              MavingTech
            </span>
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground md:text-sm">
              High School
            </span>
          </div>
        </Link>

        {/* Desktop nav center */}
        <div className="hidden items-center gap-1 lg:flex">
          {navLinks.map((item) =>
            item.children ? (
              <DesktopDropdown key={item.path} item={item} />
            ) : (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === item.path ? "text-primary" : "text-foreground/80"
                }`}
              >
                {item.label}
              </Link>
            )
          )}
        </div>

        {/* Right side: portal */}
        <div className="flex items-center gap-2">
          <Link to="/login" className="hidden sm:block">
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Portal Login
            </Button>
          </Link>

          <button
            className="flex h-10 w-10 items-center justify-center rounded-md text-foreground hover:bg-muted lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border bg-background lg:hidden"
          >
            <div className="container flex flex-col py-2">
              {navLinks.map((item) =>
                item.children ? (
                  <MobileAccordion key={item.path} item={item} onClose={() => setMobileOpen(false)} />
                ) : (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`border-b border-border/60 px-3 py-3 text-sm font-medium ${
                      location.pathname === item.path ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              )}
              <Link to="/login" onClick={() => setMobileOpen(false)} className="mt-3">
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Portal Login
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

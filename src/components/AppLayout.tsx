import { Outlet, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard, Users, GraduationCap, BookOpen,
  ClipboardCheck, FileText, Settings, LogOut, Menu, X, AlertTriangle,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const navItems = [
  { title: "Dashboard", path: "/dashboard", icon: LayoutDashboard, tip: "Overview of key metrics and school activity" },
  { title: "Students", path: "/students", icon: Users, tip: "Manage student profiles and enrollment" },
  { title: "Teachers", path: "/teachers", icon: GraduationCap, tip: "Manage teaching staff and assignments" },
  { title: "Classes", path: "/classes", icon: BookOpen, tip: "Configure classes, subjects, and schedules" },
  { title: "Attendance", path: "/attendance", icon: ClipboardCheck, tip: "Track daily student attendance" },
  { title: "Gradebook", path: "/gradebook", icon: FileText, tip: "Enter and review student grades" },
  { title: "Settings", path: "/settings", icon: Settings, tip: "Demo settings and data management" },
];

const AppLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Demo banner */}
      <div className="bg-warning/15 border-b border-warning/30 px-4 py-1.5 text-center">
        <p className="text-xs font-medium text-foreground flex items-center justify-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5 text-warning" />
          DEMO – For demonstration purposes only. All data is fictitious.
        </p>
      </div>

      <div className="flex flex-1">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-foreground/20 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed lg:sticky top-0 left-0 z-50 lg:z-auto
          h-screen w-64 flex-shrink-0
          bg-sidebar text-sidebar-foreground
          flex flex-col
          transition-transform duration-200
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}>
          {/* Header */}
          <div className="p-5 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center font-heading font-bold text-xs">
                MTBS
              </div>
              <div className="min-w-0">
                <h2 className="font-heading font-bold text-sm text-sidebar-primary-foreground truncate">MavingTech</h2>
                <p className="text-[11px] text-sidebar-foreground/60 truncate">Demonstration Academy</p>
              </div>
              <button className="lg:hidden ml-auto text-sidebar-foreground" onClick={() => setSidebarOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Tooltip key={item.path} delayDuration={600}>
                  <TooltipTrigger asChild>
                    <Link
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        active
                          ? "bg-sidebar-accent text-sidebar-primary"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      }`}
                    >
                      <item.icon className="h-4.5 w-4.5 shrink-0" />
                      {item.title}
                      {item.title === "Settings" && <span className="demo-badge ml-auto">Demo</span>}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-48">
                    {item.tip}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </nav>

          {/* User */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-semibold text-sidebar-accent-foreground">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-sidebar-primary-foreground truncate">{user?.username}</p>
                <p className="text-[11px] text-sidebar-foreground/60">{user?.role}</p>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={logout} className="text-sidebar-foreground/60 hover:text-sidebar-primary transition-colors">
                    <LogOut className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Sign out</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <header className="h-14 border-b bg-card flex items-center px-4 lg:px-6 gap-4 sticky top-0 z-30">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex-1" />
            <span className="demo-badge hidden sm:inline-flex">Demo Account</span>
          </header>

          {/* Page content */}
          <main className="flex-1 p-4 lg:p-6 overflow-auto">
            <Outlet />
          </main>

          {/* Footer */}
          <footer className="border-t px-4 py-3 text-center">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} MavingTech Business Solutions – Demo Version
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default AppLayout;

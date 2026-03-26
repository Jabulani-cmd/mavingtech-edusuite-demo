import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      {/* Add top padding on non-home pages to account for fixed navbar */}
      <main className={`flex-1 ${isHome ? "" : "pt-24 md:pt-28"}`}>{children}</main>
      <Footer />
    </div>
  );
}

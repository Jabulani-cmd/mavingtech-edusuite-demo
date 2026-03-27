import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import schoolLogo from "@/assets/mavingtech-logo.jpeg";
import { useAuth } from "@/contexts/AuthContext";
import FinanceManagement from "@/pages/admin/FinanceManagement";

export default function FinanceDashboard() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-section-warm">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-3 sm:px-4 py-2 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <img src={schoolLogo} alt="Logo" className="h-10 w-10 sm:h-16 sm:w-16 object-contain" />
            <div>
              <h1 className="font-heading text-sm sm:text-lg font-bold text-primary">Finance Portal</h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">{user?.email}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 text-xs sm:text-sm">
            <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
            <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
            <h2 className="font-heading text-lg sm:text-2xl font-bold text-primary">Finance Management</h2>
          </div>
          <FinanceManagement />
        </motion.div>
      </main>
    </div>
  );
}

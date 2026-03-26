import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import schoolLogo from "@/assets/school-logo.png";
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
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <img src={schoolLogo} alt="Logo" className="h-10 w-10 object-contain" />
            <div>
              <h1 className="font-heading text-lg font-bold text-primary">Finance Portal</h1>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6 flex items-center gap-3">
            <DollarSign className="h-6 w-6 text-accent" />
            <h2 className="font-heading text-2xl font-bold text-primary">Finance Management</h2>
          </div>
          <FinanceManagement />
        </motion.div>
      </main>
    </div>
  );
}

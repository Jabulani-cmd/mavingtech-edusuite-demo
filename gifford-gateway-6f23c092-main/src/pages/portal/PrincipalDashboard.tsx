// @ts-nocheck
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Users, GraduationCap, BookOpen, Briefcase, MessageSquare, ClipboardList, Bell, UserCheck, Building, BedDouble, Package, Calendar, Shield, DollarSign, CalendarOff } from "lucide-react";
import schoolLogo from "@/assets/school-logo.png";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Reuse admin sub-pages
import AcademicManagement from "@/pages/admin/AcademicManagement";
import StudentManagement from "@/pages/admin/StudentManagement";
import StaffManagementFull from "@/pages/admin/StaffManagementFull";
import BoardingManagement from "@/pages/admin/BoardingManagement";
import InventoryManagement from "@/pages/admin/InventoryManagement";
import CommunicationModule from "@/pages/admin/CommunicationModule";
import EMISReports from "@/pages/admin/EMISReports";
import FinanceManagement from "@/pages/admin/FinanceManagement";
import UserManagement from "@/components/admin/UserManagement";
import PersonalTimetableEditor from "@/components/PersonalTimetableEditor";
import StaffAvailabilityOverview from "@/components/admin/StaffAvailabilityOverview";

export default function PrincipalDashboard() {
  const { toast } = useToast();
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ students: 0, staff: 0, announcements: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const [studentsRes, staffRes, annRes] = await Promise.all([
        supabase.from("students").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("staff").select("id", { count: "exact", head: true }).is("deleted_at", null),
        supabase.from("announcements").select("id", { count: "exact", head: true }),
      ]);
      setStats({
        students: studentsRes.count || 0,
        staff: staffRes.count || 0,
        announcements: annRes.count || 0,
      });
    };
    fetchStats();
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={schoolLogo} alt="Gifford High School crest" className="h-16 w-16 object-contain" />
            <span className="font-heading text-lg font-bold text-primary">Principal's Portal</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Principal</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}><LogOut className="mr-1 h-4 w-4" /> Logout</Button>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 font-heading text-2xl font-bold text-primary">
          Principal's Dashboard
        </motion.h1>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Active Students", value: String(stats.students), icon: GraduationCap },
            { label: "Staff Members", value: String(stats.staff), icon: Users },
            { label: "Announcements", value: String(stats.announcements), icon: Bell },
          ].map((s, i) => (
            <Card key={i} className="border-none shadow-maroon">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-maroon-light">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="students" className="space-y-6">
          <TabsList className="flex-wrap">
            <TabsTrigger value="students"><BookOpen className="mr-1 h-4 w-4" /> Students</TabsTrigger>
            <TabsTrigger value="staff"><Briefcase className="mr-1 h-4 w-4" /> Staff Directory</TabsTrigger>
            <TabsTrigger value="academics"><GraduationCap className="mr-1 h-4 w-4" /> Academics</TabsTrigger>
            <TabsTrigger value="user-mgmt"><Shield className="mr-1 h-4 w-4" /> User Management</TabsTrigger>
            <TabsTrigger value="boarding"><BedDouble className="mr-1 h-4 w-4" /> Boarding</TabsTrigger>
            <TabsTrigger value="inventory"><Package className="mr-1 h-4 w-4" /> Inventory</TabsTrigger>
            <TabsTrigger value="communication"><MessageSquare className="mr-1 h-4 w-4" /> Communication</TabsTrigger>
            <TabsTrigger value="reports"><ClipboardList className="mr-1 h-4 w-4" /> Reports</TabsTrigger>
            <TabsTrigger value="finance"><DollarSign className="mr-1 h-4 w-4" /> Finance</TabsTrigger>
            <TabsTrigger value="timetable"><Calendar className="mr-1 h-4 w-4" /> My Timetable</TabsTrigger>
            <TabsTrigger value="staff-leave"><CalendarOff className="mr-1 h-4 w-4" /> Staff Availability</TabsTrigger>
          </TabsList>

          <TabsContent value="students"><StudentManagement /></TabsContent>
          <TabsContent value="staff"><StaffManagementFull /></TabsContent>
          <TabsContent value="academics"><AcademicManagement /></TabsContent>
          <TabsContent value="user-mgmt"><UserManagement /></TabsContent>
          <TabsContent value="boarding"><BoardingManagement /></TabsContent>
          <TabsContent value="inventory"><InventoryManagement /></TabsContent>
          <TabsContent value="communication"><CommunicationModule /></TabsContent>
          <TabsContent value="reports"><EMISReports /></TabsContent>
          <TabsContent value="finance"><FinanceManagement /></TabsContent>
          <TabsContent value="timetable"><PersonalTimetableEditor /></TabsContent>
          <TabsContent value="staff-leave"><StaffAvailabilityOverview /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

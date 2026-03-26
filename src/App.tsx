import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ScrollToTop from "@/components/ScrollToTop";
import ProtectedRoute from "@/components/ProtectedRoute";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import Index from "./pages/Index";
import About from "./pages/About";
import Academics from "./pages/Academics";
import Admissions from "./pages/Admissions";
import SchoolLife from "./pages/SchoolLife";
import News from "./pages/News";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/portal/StudentDashboard";
import ParentTeacherDashboard from "./pages/portal/ParentTeacherDashboard";
import ParentDashboard from "./pages/portal/ParentDashboard";
import TeacherDashboard from "./pages/portal/TeacherDashboard";
import AdminDashboard from "./pages/portal/AdminDashboard";
import FinanceDashboard from "./pages/portal/FinanceDashboard";
import PrincipalDashboard from "./pages/portal/PrincipalDashboard";
import DeputyPrincipalDashboard from "./pages/portal/DeputyPrincipalDashboard";
import HODDashboard from "./pages/portal/HODDashboard";
import AdminSupervisorDashboard from "./pages/portal/AdminSupervisorDashboard";
import RegistrationDashboard from "./pages/portal/RegistrationDashboard";
import Downloads from "./pages/Downloads";
import Staff from "./pages/Staff";
import Facilities from "./pages/Facilities";
import Fees from "./pages/Fees";
import Vacancies from "./pages/Vacancies";
import SchoolProjects from "./pages/SchoolProjects";
import Alumni from "./pages/Alumni";
import PayOnline from "./pages/PayOnline";
import Contact from "./pages/Contact";
import Boarding from "./pages/Boarding";
import SportsCulture from "./pages/SportsCulture";
import Awards from "./pages/Awards";
import NotFound from "./pages/NotFound";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ForceChangePassword from "./pages/ForceChangePassword";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/academics" element={<Academics />} />
            <Route path="/admissions" element={<Admissions />} />
            <Route path="/school-life" element={<SchoolLife />} />
            <Route path="/facilities" element={<Facilities />} />
            <Route path="/downloads" element={<Downloads />} />
            <Route path="/fees" element={<Fees />} />
            <Route path="/pay-online" element={<PayOnline />} />
            <Route path="/vacancies" element={<Vacancies />} />
            <Route path="/staff" element={<Staff />} />
            <Route path="/school-projects" element={<SchoolProjects />} />
            <Route path="/news" element={<News />} />
            <Route path="/alumni" element={<Alumni />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/boarding" element={<Boarding />} />
            <Route path="/sports-culture" element={<SportsCulture />} />
            <Route path="/awards" element={<Awards />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/change-password" element={<ForceChangePassword />} />
            <Route path="/login" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/portal/student" element={
              <ProtectedRoute allowedRoles={["student"]}>
                <AuthenticatedLayout><StudentDashboard /></AuthenticatedLayout>
              </ProtectedRoute>
            } />
            <Route path="/portal/teacher" element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <AuthenticatedLayout><TeacherDashboard /></AuthenticatedLayout>
              </ProtectedRoute>
            } />
            <Route path="/portal/parent-teacher" element={
              <ProtectedRoute allowedRoles={["parent"]}>
                <AuthenticatedLayout><ParentDashboard /></AuthenticatedLayout>
              </ProtectedRoute>
            } />
            <Route path="/portal/parent" element={
              <ProtectedRoute allowedRoles={["parent"]}>
                <AuthenticatedLayout><ParentDashboard /></AuthenticatedLayout>
              </ProtectedRoute>
            } />
            <Route path="/portal/admin" element={
              <ProtectedRoute allowedRoles={["admin", "principal", "deputy_principal"]}>
                <AuthenticatedLayout><AdminDashboard /></AuthenticatedLayout>
              </ProtectedRoute>
            } />
            <Route path="/portal/finance" element={
              <ProtectedRoute allowedRoles={["finance", "finance_clerk", "bursar", "admin", "principal", "deputy_principal"]}>
                <AuthenticatedLayout><FinanceDashboard /></AuthenticatedLayout>
              </ProtectedRoute>
            } />
            <Route path="/portal/principal" element={
              <ProtectedRoute allowedRoles={["principal"]}>
                <AuthenticatedLayout><PrincipalDashboard /></AuthenticatedLayout>
              </ProtectedRoute>
            } />
            <Route path="/portal/deputy-principal" element={
              <ProtectedRoute allowedRoles={["deputy_principal"]}>
                <AuthenticatedLayout><DeputyPrincipalDashboard /></AuthenticatedLayout>
              </ProtectedRoute>
            } />
            <Route path="/portal/hod" element={
              <ProtectedRoute allowedRoles={["hod"]}>
                <AuthenticatedLayout><HODDashboard /></AuthenticatedLayout>
              </ProtectedRoute>
            } />
            <Route path="/portal/admin-supervisor" element={
              <ProtectedRoute allowedRoles={["admin_supervisor"]}>
                <AuthenticatedLayout><AdminSupervisorDashboard /></AuthenticatedLayout>
              </ProtectedRoute>
            } />
            <Route path="/portal/registration" element={
              <ProtectedRoute allowedRoles={["registration", "admin"]}>
                <RegistrationDashboard />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

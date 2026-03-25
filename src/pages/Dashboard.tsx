import { useDemoData } from "@/contexts/DemoDataContext";
import { motion } from "framer-motion";
import { Users, GraduationCap, ClipboardCheck, CalendarDays, TrendingUp, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const fadeUp = (i: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.35 } },
});

const Dashboard = () => {
  const { students, teachers, attendance, events } = useDemoData();

  const activeStudents = students.filter((s) => s.status === "active").length;
  const activeTeachers = teachers.filter((t) => t.status === "active").length;

  const todayAttendance = attendance.filter((a) => a.date === "2025-03-24");
  const presentCount = todayAttendance.filter((a) => a.status === "present" || a.status === "late").length;
  const attendanceRate = todayAttendance.length > 0 ? Math.round((presentCount / todayAttendance.length) * 100) : 0;

  const metrics = [
    { label: "Total Students", value: activeStudents, icon: Users, color: "text-primary" },
    { label: "Active Teachers", value: activeTeachers, icon: GraduationCap, color: "text-accent" },
    { label: "Attendance Rate", value: `${attendanceRate}%`, icon: ClipboardCheck, color: "text-success" },
    { label: "Upcoming Events", value: events.length, icon: CalendarDays, color: "text-warning" },
  ];

  const eventTypeColor: Record<string, string> = {
    exam: "destructive",
    meeting: "default",
    holiday: "secondary",
    event: "outline",
  };

  return (
    <div>
      <div className="page-header flex items-center gap-3">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">MavingTech Demonstration Academy – Overview</p>
        </div>
        <span className="demo-badge ml-auto hidden sm:inline-flex">Demo Data</span>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map((m, i) => (
          <motion.div key={m.label} {...fadeUp(i)} className="metric-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">{m.label}</span>
              <m.icon className={`h-5 w-5 ${m.color}`} />
            </div>
            <p className="text-3xl font-bold font-heading text-foreground">{m.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent attendance */}
        <motion.div {...fadeUp(4)}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-heading flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Today's Attendance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {todayAttendance.slice(0, 6).map((a) => (
                  <div key={a.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">{a.studentName}</p>
                      <p className="text-xs text-muted-foreground">Class {a.class}</p>
                    </div>
                    <Badge variant={a.status === "present" ? "default" : a.status === "late" ? "secondary" : "destructive"}>
                      {a.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming events */}
        <motion.div {...fadeUp(5)}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-heading flex items-center gap-2">
                <Clock className="h-4 w-4 text-warning" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {events.map((e) => (
                  <div key={e.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">{e.title}</p>
                      <p className="text-xs text-muted-foreground">{e.date}</p>
                    </div>
                    <Badge variant={eventTypeColor[e.type] as any}>{e.type}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;

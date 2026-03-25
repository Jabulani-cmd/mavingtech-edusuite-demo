import { useState } from "react";
import { useDemoData } from "@/contexts/DemoDataContext";
import { motion } from "framer-motion";
import { CalendarDays, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const statusIcon = {
  present: <CheckCircle2 className="h-4 w-4 text-success" />,
  absent: <XCircle className="h-4 w-4 text-destructive" />,
  late: <Clock className="h-4 w-4 text-warning" />,
  excused: <AlertCircle className="h-4 w-4 text-muted-foreground" />,
};

const Attendance = () => {
  const { attendance, setAttendance, students } = useDemoData();
  const [date, setDate] = useState("2025-03-24");

  const dayRecords = attendance.filter((a) => a.date === date);

  const summary = {
    present: dayRecords.filter((a) => a.status === "present").length,
    late: dayRecords.filter((a) => a.status === "late").length,
    absent: dayRecords.filter((a) => a.status === "absent").length,
    excused: dayRecords.filter((a) => a.status === "excused").length,
  };

  const toggleStatus = (id: string) => {
    const order: Array<"present" | "absent" | "late" | "excused"> = ["present", "absent", "late", "excused"];
    setAttendance((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        const next = order[(order.indexOf(a.status) + 1) % order.length];
        return { ...a, status: next };
      })
    );
    toast.success("Status updated (demo)");
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Attendance Tracking</h1>
        <p className="page-subtitle">Mark and review daily student attendance</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-auto" />
        </div>
        <div className="flex gap-3 flex-wrap">
          {(["present", "late", "absent", "excused"] as const).map((s) => (
            <div key={s} className="flex items-center gap-1.5 text-sm">
              {statusIcon[s]}
              <span className="text-muted-foreground capitalize">{s}: <strong className="text-foreground">{summary[s]}</strong></span>
            </div>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-heading">
            Records for {date} <span className="demo-badge ml-2">Demo</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {dayRecords.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium text-muted-foreground">Student</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Class</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {dayRecords.map((a, i) => (
                  <motion.tr key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-medium text-foreground">{a.studentName}</td>
                    <td className="p-3 text-muted-foreground">{a.class}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        {statusIcon[a.status]}
                        <Badge variant={a.status === "present" ? "default" : a.status === "absent" ? "destructive" : "secondary"}>
                          {a.status}
                        </Badge>
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <Button variant="outline" size="sm" onClick={() => toggleStatus(a.id)}>
                        Change
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="p-6 text-center text-muted-foreground">No records for this date. Try 2025-03-24 or 2025-03-21.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Attendance;

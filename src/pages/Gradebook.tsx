import { useState } from "react";
import { useDemoData } from "@/contexts/DemoDataContext";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const getLetterGrade = (pct: number) => {
  if (pct >= 90) return { grade: "A", color: "default" as const };
  if (pct >= 80) return { grade: "B", color: "default" as const };
  if (pct >= 70) return { grade: "C", color: "secondary" as const };
  if (pct >= 60) return { grade: "D", color: "secondary" as const };
  return { grade: "F", color: "destructive" as const };
};

const Gradebook = () => {
  const { grades } = useDemoData();
  const [search, setSearch] = useState("");

  const filtered = grades.filter((g) =>
    `${g.studentName} ${g.subject} ${g.assignment}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Gradebook</h1>
        <p className="page-subtitle">View and manage student grades across subjects</p>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by student, subject..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium text-muted-foreground">Student</th>
                <th className="text-left p-3 font-medium text-muted-foreground hidden sm:table-cell">Subject</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Assignment</th>
                <th className="text-center p-3 font-medium text-muted-foreground">Score</th>
                <th className="text-center p-3 font-medium text-muted-foreground">Grade</th>
                <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((g, i) => {
                const pct = Math.round((g.score / g.maxScore) * 100);
                const { grade, color } = getLetterGrade(pct);
                return (
                  <motion.tr key={g.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-medium text-foreground">{g.studentName}</td>
                    <td className="p-3 hidden sm:table-cell text-muted-foreground">{g.subject}</td>
                    <td className="p-3 text-foreground">{g.assignment}</td>
                    <td className="p-3 text-center text-foreground">{g.score}/{g.maxScore} <span className="text-muted-foreground">({pct}%)</span></td>
                    <td className="p-3 text-center"><Badge variant={color}>{grade}</Badge></td>
                    <td className="p-3 hidden md:table-cell text-muted-foreground">{g.date}</td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="p-6 text-center text-muted-foreground">No grades found</p>}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
        <span className="demo-badge">Demo</span> All grades shown are fictitious sample data.
      </p>
    </div>
  );
};

export default Gradebook;

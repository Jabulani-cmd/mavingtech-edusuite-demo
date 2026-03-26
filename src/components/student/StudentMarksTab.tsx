// @ts-nocheck
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  studentId: string | null;
}

function getZIMSECGrade(mark: number): string {
  if (mark >= 90) return "A*";
  if (mark >= 80) return "A";
  if (mark >= 70) return "B";
  if (mark >= 60) return "C";
  if (mark >= 50) return "D";
  if (mark >= 40) return "E";
  return "U";
}

function getGradeColor(grade: string): string {
  switch (grade) {
    case "A*": return "bg-emerald-100 text-emerald-800 border-emerald-300";
    case "A": return "bg-green-100 text-green-800 border-green-300";
    case "B": return "bg-blue-100 text-blue-800 border-blue-300";
    case "C": return "bg-sky-100 text-sky-800 border-sky-300";
    case "D": return "bg-amber-100 text-amber-800 border-amber-300";
    case "E": return "bg-orange-100 text-orange-800 border-orange-300";
    case "U": return "bg-red-100 text-red-800 border-red-300";
    default: return "bg-muted text-muted-foreground";
  }
}

const termOptions = ["Term 1", "Term 2", "Term 3"];

export default function StudentMarksTab({ studentId }: Props) {
  const [marks, setMarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTerm, setSelectedTerm] = useState("all");

  useEffect(() => {
    if (studentId) fetchMarks();
    else setLoading(false);
  }, [studentId]);

  const fetchMarks = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("marks")
      .select("*, subjects(name)")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false });
    if (data) setMarks(data);
    setLoading(false);
  };

  const filtered = marks.filter(m => selectedTerm === "all" || m.term === selectedTerm);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Select value={selectedTerm} onValueChange={setSelectedTerm}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Filter by term" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Terms</SelectItem>
          {termOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
        </SelectContent>
      </Select>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No marks recorded yet.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">Subject</th>
                    <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">Comment</th>
                    <th className="px-3 py-2.5 text-center font-medium text-muted-foreground">Type</th>
                    <th className="px-3 py-2.5 text-center font-medium text-muted-foreground">Term</th>
                    <th className="px-3 py-2.5 text-center font-medium text-muted-foreground">Mark</th>
                    <th className="px-3 py-2.5 text-center font-medium text-muted-foreground">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(m => {
                    const grade = getZIMSECGrade(m.mark);
                    return (
                      <tr key={m.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-3 py-3 font-medium">{m.subjects?.name || "—"}</td>
                        <td className="px-3 py-3 text-muted-foreground">{m.comment || "—"}</td>
                        <td className="px-3 py-3 text-center capitalize">{m.assessment_type}</td>
                        <td className="px-3 py-3 text-center">{m.term}</td>
                        <td className="px-3 py-3 text-center font-bold">{m.mark}%</td>
                        <td className="px-3 py-3 text-center">
                          <Badge className={`text-xs ${getGradeColor(grade)}`} variant="outline">{grade}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

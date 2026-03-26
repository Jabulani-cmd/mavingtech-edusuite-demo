// @ts-nocheck
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const shortDays = ["Mon", "Tue", "Wed", "Thu", "Fri"];

interface Props {
  studentClassId: string | null;
  studentId?: string | null;
}

export default function StudentTimetableTab({ studentClassId, studentId }: Props) {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sportsActivities, setSportsActivities] = useState<string[]>([]);
  const today = new Date().getDay(); // 0=Sun, 1=Mon...
  const [selectedDay, setSelectedDay] = useState(today >= 1 && today <= 5 ? today : 1);

  useEffect(() => {
    if (studentClassId) fetchTimetable();
    if (studentId) fetchSports();
  }, [studentClassId, studentId]);

  const fetchTimetable = async () => {
    setLoading(true);
    const { data: entries } = await supabase
      .from("timetable_entries")
      .select("*, subjects(name), staff(full_name), classes(name)")
      .eq("class_id", studentClassId!)
      .order("start_time");

    if (entries && entries.length > 0) {
      setEntries(entries);
    } else {
      const { data: basic } = await supabase
        .from("timetable")
        .select("*, subjects(name)")
        .eq("class_id", studentClassId!)
        .order("time_slot");
      setEntries(basic || []);
    }
    setLoading(false);
  };

  const fetchSports = async () => {
    if (!studentId) return;
    const { data } = await supabase
      .from("students")
      .select("sports_activities")
      .eq("id", studentId)
      .single();
    if (data?.sports_activities) {
      setSportsActivities(data.sports_activities as string[]);
    }
  };

  const dayEntries = entries.filter((e) => e.day_of_week === selectedDay);
  const isDetailed = entries.length > 0 && entries[0].start_time;

  if (loading) {
    return <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />)}</div>;
  }

  return (
    <div className="space-y-4">
      {/* Day Selector */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {[1, 2, 3, 4, 5].map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDay(d)}
            className={`flex-1 min-w-[56px] rounded-lg py-2.5 text-center text-xs font-medium transition-colors ${
              selectedDay === d
                ? "bg-secondary text-secondary-foreground"
                : today === d
                  ? "bg-secondary/10 text-secondary border border-secondary/30"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {shortDays[d - 1]}
            {today === d && <span className="block text-[9px] mt-0.5">Today</span>}
          </button>
        ))}
      </div>

      {/* Schedule */}
      {dayEntries.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <Calendar className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No classes scheduled for {dayNames[selectedDay - 1]}.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {dayEntries.map((e, i) => (
            <Card key={e.id || i}>
              <CardContent className="flex items-center gap-3 p-3">
                <div className="flex flex-col items-center justify-center min-w-[50px] text-center">
                  <span className="text-xs font-bold text-foreground">
                    {isDetailed ? e.start_time : e.time_slot}
                  </span>
                  {isDetailed && e.end_time && (
                    <span className="text-[10px] text-muted-foreground">{e.end_time}</span>
                  )}
                </div>
                <div className="h-10 w-0.5 bg-secondary/30 rounded-full" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{e.subjects?.name || "Free Period"}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {e.staff?.full_name && (
                      <span className="text-[11px] text-muted-foreground">{e.staff.full_name}</span>
                    )}
                    {e.room && (
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0">{e.room}</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Sports & Extracurricular Activities Section */}
      {sportsActivities.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-secondary" />
            <h3 className="text-sm font-semibold text-foreground">Sports & Activities</h3>
          </div>
          <Card>
            <CardContent className="p-3">
              <div className="flex flex-wrap gap-2">
                {sportsActivities.map((sport) => (
                  <Badge key={sport} variant="secondary" className="text-xs">
                    {sport}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

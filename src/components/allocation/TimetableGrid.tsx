import { useAllocation, DAYS, TimetableSlot } from "@/contexts/AllocationContext";
import { Card } from "@/components/ui/card";
import { BookOpen, User, MapPin, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  classId?: string;
  teacherId?: string;
  highlightToday?: boolean;
}

/**
 * Shared timetable viewer. Every cell shows Period, Subject, Teacher, Venue.
 * Used by Admin (per class), Teacher (own schedule), Student & Parent portals.
 */
export default function TimetableGrid({ classId, teacherId, highlightToday = true }: Props) {
  const { slots, subjects, teachers, rooms, classes, periodSchedule } = useAllocation();

  const filtered = slots.filter((s) => {
    if (classId && s.classId !== classId) return false;
    if (teacherId && s.teacherId !== teacherId) return false;
    return true;
  });

  const todayIdx = (() => {
    const d = new Date().getDay(); // 0 Sun..6 Sat
    return d >= 1 && d <= 5 ? d - 1 : -1;
  })();

  function cellFor(day: number, period: number): TimetableSlot | undefined {
    return filtered.find((s) => s.day === day && s.period === period);
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="bg-muted">
            <th className="border-b border-border px-3 py-2 text-left font-semibold text-muted-foreground">
              Period
            </th>
            {DAYS.map((d, i) => (
              <th
                key={d}
                className={cn(
                  "border-b border-l border-border px-3 py-2 text-center font-semibold",
                  highlightToday && i === todayIdx ? "bg-primary/10 text-primary" : "text-muted-foreground"
                )}
              >
                {d}
                {highlightToday && i === todayIdx && <span className="ml-1 text-[10px]">• Today</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {periodSchedule.map((p) => (
            <tr key={p.period} className="align-top">
              <td className="border-t border-border px-3 py-2 font-medium text-foreground/80 whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span>P{p.period}</span>
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {p.start}–{p.end}
                </div>
              </td>
              {DAYS.map((_, di) => {
                const slot = cellFor(di, p.period);
                const subj = subjects.find((s) => s.id === slot?.subjectId);
                const teacher = teachers.find((t) => t.id === slot?.teacherId);
                const room = rooms.find((r) => r.id === slot?.roomId);
                const cls = classes.find((c) => c.id === slot?.classId);
                const filled = subj && teacher && room;
                const isToday = highlightToday && di === todayIdx;
                return (
                  <td
                    key={di}
                    className={cn(
                      "border-t border-l border-border p-1.5 min-w-[140px]",
                      isToday && "bg-primary/5"
                    )}
                  >
                    {filled ? (
                      <Card
                        className="p-2 border-l-4 shadow-sm transition hover:shadow-md cursor-pointer"
                        style={{ borderLeftColor: subj!.color }}
                        title={`${subj!.name} • ${teacher!.name} • ${room!.name}`}
                      >
                        <div className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
                          <Clock className="h-2.5 w-2.5" /> P{p.period} • {p.start}
                        </div>
                        <div className="flex items-center gap-1 mt-1 font-semibold text-foreground">
                          <BookOpen className="h-3 w-3 shrink-0" style={{ color: subj!.color }} />
                          <span className="truncate">{subj!.name}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <User className="h-3 w-3 shrink-0" />
                          <span className="truncate">{teacher!.name}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{room!.name}</span>
                        </div>
                        {!classId && cls && (
                          <div className="mt-1 text-[10px] text-muted-foreground/80">{cls.name}</div>
                        )}
                      </Card>
                    ) : (
                      <div className="h-full min-h-[60px] rounded border border-dashed border-border/50 grid place-items-center text-[10px] text-muted-foreground/60">
                        Free
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

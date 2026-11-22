import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { AlertTriangle, Bell, ClipboardX, Loader2, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { FINDING_SELECT, KIND_LABELS, type AgentFinding } from "@/lib/agent";

export interface Notification {
  id: string;
  title: string;
  message: string | null;
  type: string;
  is_read: boolean;
  created_at: string;
  link: string | null;
}

const isAgentNotification = (n: Notification) => n.title.startsWith("School agent");

const KIND_ICON: Record<string, typeof AlertTriangle> = {
  at_risk: AlertTriangle,
  attendance_not_taken: ClipboardX,
  marks_overdue: ClipboardX,
  fee_arrears: Wallet,
};
const SEVERITY_STYLE: Record<string, string> = {
  high: "bg-red-100 text-red-800 border-red-200",
  medium: "bg-amber-100 text-amber-800 border-amber-200",
  low: "bg-slate-100 text-slate-700 border-slate-200",
};
const SEVERITY_LABEL: Record<string, string> = { high: "High priority", medium: "Medium", low: "Low" };

/** Plain-language explanation of what the school agent is and why it sent the notification. */
function AgentExplanation() {
  return (
    <div className="space-y-2 rounded-md bg-muted/60 p-3 text-sm">
      <p className="font-medium text-foreground">What is this?</p>
      <p className="text-muted-foreground">
        The school agent checks attendance, marks and registers from the school's own records every few minutes. When
        it spots something that needs a teacher's attention it raises an item for you to review.
      </p>
      <p className="font-medium text-foreground">What do I need to do?</p>
      <ul className="list-disc space-y-0.5 pl-5 text-muted-foreground">
        <li><span className="font-medium text-foreground">Learner needs support:</span> a learner you teach shows low attendance or falling marks. Speak to the learner or the family.</li>
        <li><span className="font-medium text-foreground">Register not taken:</span> a class register for a lesson is still empty. Take the register.</li>
        <li><span className="font-medium text-foreground">Marks overdue:</span> marks for a set assessment have not been entered. Enter them.</li>
      </ul>
      <p className="text-muted-foreground">Nothing changes automatically. Mark each item Seen, Done or Not correct when you have dealt with it.</p>
    </div>
  );
}

/** The items behind an agent notification: whatever this user can currently see and still has open. */
function OpenAgentItems() {
  const [items, setItems] = useState<AgentFinding[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("agent_findings")
      .select(FINDING_SELECT)
      .in("status", ["open", "acknowledged"])
      .order("updated_at", { ascending: false })
      .limit(10)
      .then(({ data }) => { if (!cancelled) setItems((data ?? []) as AgentFinding[]); });
    return () => { cancelled = true; };
  }, []);

  if (items === null) {
    return <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading your items…</p>;
  }
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">You have no open items right now. Everything raised has been dealt with.</p>;
  }
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">Items waiting for you ({items.length})</p>
      {items.map((f) => {
        const Icon = KIND_ICON[f.kind] ?? AlertTriangle;
        const actions = Array.isArray(f.suggested_actions) ? (f.suggested_actions as string[]) : [];
        return (
          <div key={f.id} className="rounded-lg border p-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="flex min-w-0 items-start gap-2">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-tight">{f.students?.full_name ? `${f.students.full_name} · ` : ""}{f.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {KIND_LABELS[f.kind] ?? f.kind}
                    {f.classes?.name ? ` · ${f.classes.name}` : ""}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className={SEVERITY_STYLE[f.severity] ?? ""}>{SEVERITY_LABEL[f.severity] ?? f.severity}</Badge>
            </div>
            {f.explanation && <p className="mt-2 text-sm">{f.explanation}</p>}
            {actions.length > 0 && (
              <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-muted-foreground">
                {actions.map((a) => <li key={a}>{a}</li>)}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Full view of one notification: the whole message, when it arrived and, for agent alerts, what it means and what to do. */
export default function NotificationDetail({ notification, onClose }: { notification: Notification | null; onClose: () => void }) {
  const navigate = useNavigate();
  const n = notification;
  const agent = n ? isAgentNotification(n) : false;

  return (
    <Dialog open={!!n} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        {n && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-start gap-2 pr-6 text-left">
                <Bell className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                {n.title}
              </DialogTitle>
              <DialogDescription className="text-left">
                {format(new Date(n.created_at), "EEEE d MMMM yyyy, h:mm a")}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {n.message && <p className="text-sm leading-relaxed text-foreground">{n.message}</p>}
              {agent && (
                <>
                  <AgentExplanation />
                  <OpenAgentItems />
                </>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={onClose}>Close</Button>
              {n.link && (
                <Button onClick={() => { const to = n.link!; onClose(); navigate(to); }}>
                  {agent ? "Go to my dashboard" : "Open"}
                </Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

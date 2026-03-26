// @ts-nocheck
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Receipt, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Props {
  studentId: string | null;
}

export default function StudentFeeTab({ studentId }: Props) {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (studentId) fetchFeeData();
  }, [studentId]);

  const fetchFeeData = async () => {
    setLoading(true);
    const [{ data: inv }, { data: pay }] = await Promise.all([
      supabase.from("invoices").select("*").eq("student_id", studentId!).order("created_at", { ascending: false }),
      supabase.from("payments").select("*").eq("student_id", studentId!).order("payment_date", { ascending: false }),
    ]);
    setInvoices(inv || []);
    setPayments(pay || []);
    setLoading(false);
  };

  const totalOwed = invoices.reduce((sum, i) => sum + (i.total_usd - i.paid_usd), 0);

  if (loading) {
    return <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />)}</div>;
  }

  return (
    <div className="space-y-4">
      {/* Balance Summary */}
      <Card className={totalOwed > 0 ? "border-destructive/30 bg-destructive/5" : "bg-green-50 border-green-200"}>
        <CardContent className="p-4 text-center">
          <p className="text-sm text-muted-foreground">Outstanding Balance</p>
          <p className={`text-3xl font-bold ${totalOwed > 0 ? "text-destructive" : "text-green-600"}`}>
            ${totalOwed.toFixed(2)}
          </p>
        </CardContent>
      </Card>

      {/* Invoices */}
      {invoices.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2">Invoices</h3>
          <div className="space-y-2">
            {invoices.map((inv) => (
              <Card key={inv.id}>
                <CardContent className="flex items-center gap-3 p-3">
                  <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{inv.invoice_number}</p>
                    <p className="text-[11px] text-muted-foreground">{inv.term} · {inv.academic_year}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">${inv.total_usd}</p>
                    <Badge
                      className={`text-[9px] ${
                        inv.status === "paid" ? "bg-green-100 text-green-700" :
                        inv.status === "partial" ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      } border-0`}
                    >
                      {inv.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Payments */}
      {payments.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2">Payment History</h3>
          <div className="space-y-2">
            {payments.map((p) => (
              <Card key={p.id}>
                <CardContent className="flex items-center gap-3 p-3">
                  <Receipt className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{p.receipt_number}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {format(new Date(p.payment_date), "MMM d, yyyy")} · {p.payment_method}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-green-600">${p.amount_usd}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {invoices.length === 0 && payments.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center">
            <DollarSign className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No fee records found.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

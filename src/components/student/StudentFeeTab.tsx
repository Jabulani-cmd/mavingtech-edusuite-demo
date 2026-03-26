// @ts-nocheck
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, Printer, FileText, Receipt } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { buildStatementHtml, SCHOOL_LOGO_URL } from "@/lib/finance/pdf";
import { openPrintWindow } from "@/lib/finance/print";
import { useExchangeRate } from "@/hooks/useExchangeRate";
import { useIsMobile } from "@/hooks/use-mobile";

const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

interface Props {
  studentId: string | null;
}

export default function StudentFeeTab({ studentId }: Props) {
  const { toast } = useToast();
  const { rate, usdToZig } = useExchangeRate();
  const isMobile = useIsMobile();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (studentId) fetchData();
    else setLoading(false);
  }, [studentId]);

  const fetchData = async () => {
    setLoading(true);
    const [invRes, payRes] = await Promise.all([
      supabase
        .from("invoices")
        .select("*, students(full_name, admission_number, form)")
        .eq("student_id", studentId)
        .order("created_at", { ascending: false }),
      supabase
        .from("payments")
        .select("*, invoices(invoice_number)")
        .eq("student_id", studentId)
        .order("payment_date", { ascending: false }),
    ]);
    if (invRes.error) {
      toast({ title: "Error", description: invRes.error.message, variant: "destructive" });
    } else {
      setInvoices(invRes.data || []);
    }
    if (payRes.error) {
      toast({ title: "Error", description: payRes.error.message, variant: "destructive" });
    } else {
      setPayments(payRes.data || []);
    }
    setLoading(false);
  };

  const totalInvoicedUsd = invoices.reduce((sum, i) => sum + parseFloat(i.total_usd || 0), 0);
  const totalPaidUsd = invoices.reduce((sum, i) => sum + parseFloat(i.paid_usd || 0), 0);
  const balanceUsd = totalInvoicedUsd - totalPaidUsd;

  const printStatement = () => {
    if (invoices.length === 0 && payments.length === 0) {
      toast({ title: "Nothing to print", variant: "destructive" });
      return;
    }
    const student = (invoices[0] as any)?.students || (payments[0] as any)?.students;
    const html = buildStatementHtml({
      logoUrl: SCHOOL_LOGO_URL,
      student: {
        fullName: student?.full_name || "—",
        admissionNumber: student?.admission_number || "—",
        form: student?.form || "—",
      },
      invoices: invoices.map((i: any) => ({
        invoice_number: i.invoice_number,
        term: i.term,
        academic_year: i.academic_year,
        total_usd: i.total_usd,
        total_zig: i.total_zig,
        paid_usd: i.paid_usd,
        paid_zig: i.paid_zig,
        status: i.status,
      })),
      payments: payments.map((p: any) => ({
        receipt_number: p.receipt_number,
        payment_date: p.payment_date,
        amount_usd: p.amount_usd,
        amount_zig: p.amount_zig,
        payment_method: p.payment_method,
        reference_number: p.reference_number,
      })),
    });
    openPrintWindow(html);
  };

  const statusBadge = (status: string) => (
    <Badge
      variant="outline"
      className={
        status === "paid"
          ? "bg-green-100 text-green-800"
          : status === "partial"
            ? "bg-amber-100 text-amber-800"
            : "bg-red-100 text-red-800"
      }
    >
      {status}
    </Badge>
  );

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
        <div>
          <h2 className="text-lg font-bold">Fee Statement</h2>
          <p className="text-sm text-muted-foreground">All invoices and payments</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={printStatement}
          disabled={invoices.length === 0 && payments.length === 0}
        >
          <Printer className="mr-1 h-4 w-4" /> Print Statement
        </Button>
      </div>

      {/* Balance summary */}
      <Card
        className={
          balanceUsd < 0
            ? "bg-green-50 border-green-200"
            : balanceUsd > 0
              ? "bg-destructive/5 border-destructive/30"
              : ""
        }
      >
        <CardContent className="p-4 flex items-center gap-4">
          <DollarSign
            className={`h-8 w-8 flex-shrink-0 ${balanceUsd < 0 ? "text-green-600" : balanceUsd > 0 ? "text-destructive" : "text-muted-foreground"}`}
          />
          <div className="min-w-0">
            <p
              className={`text-2xl font-bold ${balanceUsd < 0 ? "text-green-600" : balanceUsd > 0 ? "text-destructive" : "text-foreground"}`}
            >
              ${balanceUsd < 0 ? fmt(Math.abs(balanceUsd)) : fmt(balanceUsd)}
            </p>
            <p className="text-sm text-muted-foreground">
              {balanceUsd < 0 ? "Credit Balance" : balanceUsd > 0 ? "Outstanding Balance" : "No Balance"}
            </p>
            <p className="text-xs text-muted-foreground mt-1 break-words">
              Invoiced: ${fmt(totalInvoicedUsd)} (ZiG {fmt(usdToZig(totalInvoicedUsd))}) · Paid: ${fmt(totalPaidUsd)} (ZiG {fmt(usdToZig(totalPaidUsd))})
            </p>
            <p className="text-xs text-muted-foreground">
              Rate: 1 USD = {rate} ZiG
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Invoices</CardTitle>
        </CardHeader>
        <CardContent className={isMobile ? "px-3 pb-3" : "p-0"}>
          {invoices.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No invoices found.</p>
          ) : isMobile ? (
            <div className="space-y-2">
              {invoices.map((inv) => {
                const invPayments = payments.filter((p) => p.invoice_id === inv.id);
                const actualPaid = invPayments.reduce((sum, p) => sum + parseFloat(p.amount_usd || 0), 0);
                const balance = inv.total_usd - actualPaid;
                return (
                  <Card key={inv.id} className="border">
                    <CardContent className="p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-medium">{inv.invoice_number}</span>
                        {statusBadge(inv.status)}
                      </div>
                      <p className="text-xs text-muted-foreground">{inv.term} {inv.academic_year}</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mt-1">
                        <span className="text-muted-foreground">Total:</span>
                        <span className="text-right font-mono">${fmt(inv.total_usd)}</span>
                        <span className="text-muted-foreground">ZiG:</span>
                        <span className="text-right font-mono text-muted-foreground">ZiG {fmt(usdToZig(inv.total_usd))}</span>
                        <span className="text-muted-foreground">Paid:</span>
                        <span className="text-right font-mono">${fmt(actualPaid)}</span>
                        <span className="text-muted-foreground">Balance:</span>
                        <span className={`text-right font-mono ${balance < 0 ? "text-green-600" : ""}`}>
                          {balance < 0 ? `+$${fmt(Math.abs(balance))} credit` : `$${fmt(balance)}`}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Term</TableHead>
                    <TableHead className="text-right">Total (USD)</TableHead>
                    <TableHead className="text-right">Total (ZiG)</TableHead>
                    <TableHead className="text-right">Paid (USD)</TableHead>
                    <TableHead className="text-right">Balance (USD)</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((inv) => {
                    const invPayments = payments.filter((p) => p.invoice_id === inv.id);
                    const actualPaid = invPayments.reduce((sum, p) => sum + parseFloat(p.amount_usd || 0), 0);
                    const balance = inv.total_usd - actualPaid;
                    return (
                      <TableRow key={inv.id}>
                        <TableCell className="font-mono text-xs">{inv.invoice_number}</TableCell>
                        <TableCell>{inv.term} {inv.academic_year}</TableCell>
                        <TableCell className="text-right">${fmt(inv.total_usd)}</TableCell>
                        <TableCell className="text-right text-muted-foreground">ZiG {fmt(usdToZig(inv.total_usd))}</TableCell>
                        <TableCell className="text-right">${fmt(actualPaid)}</TableCell>
                        <TableCell className="text-right">
                          {balance < 0 ? (
                            <span className="text-green-600">+${fmt(Math.abs(balance))} credit</span>
                          ) : (
                            `$${fmt(balance)}`
                          )}
                        </TableCell>
                        <TableCell className="text-center">{statusBadge(inv.status)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment history */}
      {payments.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Payment History</CardTitle>
          </CardHeader>
          <CardContent className={isMobile ? "px-3 pb-3" : "p-0"}>
            {isMobile ? (
              <div className="space-y-2">
                {payments.map((p) => (
                  <Card key={p.id} className="border">
                    <CardContent className="p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-medium">{p.receipt_number}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => {}}
                          title="Print Receipt"
                        >
                          <Printer className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(p.payment_date), "dd MMM yyyy")} · {p.payment_method}
                      </p>
                      {p.invoices?.invoice_number && (
                        <p className="text-xs text-muted-foreground">Invoice: {p.invoices.invoice_number}</p>
                      )}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mt-1">
                        <span className="text-muted-foreground">USD:</span>
                        <span className="text-right font-mono font-medium">${fmt(p.amount_usd)}</span>
                        <span className="text-muted-foreground">ZiG:</span>
                        <span className="text-right font-mono text-muted-foreground">ZiG {fmt(p.amount_zig)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Receipt #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Invoice</TableHead>
                      <TableHead className="text-right">USD</TableHead>
                      <TableHead className="text-right">ZiG</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead className="text-center">Receipt</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-mono text-xs">{p.receipt_number}</TableCell>
                        <TableCell>{format(new Date(p.payment_date), "dd MMM yyyy")}</TableCell>
                        <TableCell className="font-mono text-xs">{p.invoices?.invoice_number || "—"}</TableCell>
                        <TableCell className="text-right font-mono">${fmt(p.amount_usd)}</TableCell>
                        <TableCell className="text-right font-mono">ZiG {fmt(p.amount_zig)}</TableCell>
                        <TableCell>{p.payment_method}</TableCell>
                        <TableCell className="text-center">
                          <Button variant="ghost" size="icon" onClick={() => {}} title="Print Receipt">
                            <Printer className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

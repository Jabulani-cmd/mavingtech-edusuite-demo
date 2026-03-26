// @ts-nocheck
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Download, Users, Copy, RefreshCw, KeyRound, Printer } from "lucide-react";
import { format } from "date-fns";

const formOptions = ["Form 1", "Form 2", "Form 3", "Form 4", "Lower 6", "Upper 6"];

type VerificationCode = {
  id: string;
  student_id: string;
  code: string;
  created_at: string;
  expires_at: string;
  used_at: string | null;
  used_by: string | null;
  student?: {
    full_name: string;
    admission_number: string;
    form: string;
    stream: string | null;
  };
};

export default function VerificationCodesManager() {
  const { toast } = useToast();
  const [codes, setCodes] = useState<VerificationCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterForm, setFilterForm] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkForm, setBulkForm] = useState("all");
  const [generating, setGenerating] = useState(false);
  const [bulkResults, setBulkResults] = useState<any[] | null>(null);

  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("student_verification_codes")
      .select("*, student:students(full_name, admission_number, form, stream)")
      .order("created_at", { ascending: false });
    if (data) setCodes(data as any);
    if (error) toast({ title: "Error loading codes", description: error.message, variant: "destructive" });
    setLoading(false);
  };

  const isExpired = (code: VerificationCode) => new Date(code.expires_at) < new Date();
  const isUsed = (code: VerificationCode) => !!code.used_at;

  const getStatus = (code: VerificationCode) => {
    if (isUsed(code)) return "used";
    if (isExpired(code)) return "expired";
    return "active";
  };

  const filtered = codes.filter((c) => {
    const status = getStatus(c);
    const matchSearch =
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.student?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.student?.admission_number?.toLowerCase().includes(search.toLowerCase());
    const matchForm = filterForm === "all" || c.student?.form === filterForm;
    const matchStatus = filterStatus === "all" || status === filterStatus;
    return matchSearch && matchForm && matchStatus;
  });

  const generateSingleCode = async (studentId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/link-child`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ action: "generate-code", student_id: studentId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({ title: "Code generated successfully" });
      fetchCodes();
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    }
  };

  const bulkGenerate = async () => {
    setGenerating(true);
    setBulkResults(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/link-child`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ action: "bulk-generate-codes", form_filter: bulkForm }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBulkResults(data.results);
      toast({ title: `Generated codes for ${data.results.filter((r: any) => r.code).length} students` });
      fetchCodes();
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    }
    setGenerating(false);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Code copied to clipboard" });
  };

  const exportCSV = (data: any[], filename: string) => {
    const header = "Admission Number,Student Name,Form,Stream,Verification Code,Status,Created,Expires";
    const rows = data.map((r) => {
      const status = r.code ? (r.used_at ? "Used" : new Date(r.expires_at) < new Date() ? "Expired" : "Active") : "Error";
      return `${r.student?.admission_number || r.admission_number},"${r.student?.full_name || r.full_name}",${r.student?.form || r.form},${r.student?.stream || r.stream || ""},${r.code || ""},${status},${r.created_at ? format(new Date(r.created_at), "yyyy-MM-dd") : ""},${r.expires_at ? format(new Date(r.expires_at), "yyyy-MM-dd") : ""}`;
    });
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printCodes = () => {
    const activeCodes = filtered.filter((c) => getStatus(c) === "active");
    const printContent = `
      <html><head><title>Verification Codes - Gifford High School</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { font-size: 18px; margin-bottom: 4px; }
        p { font-size: 12px; color: #666; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th, td { border: 1px solid #ccc; padding: 6px 10px; text-align: left; }
        th { background: #f0f0f0; font-weight: bold; }
        .code { font-family: monospace; font-weight: bold; font-size: 14px; letter-spacing: 2px; }
        @media print { body { padding: 0; } }
      </style></head><body>
      <h1>Gifford High School — Parent Verification Codes</h1>
      <p>Generated: ${format(new Date(), "dd MMM yyyy")}</p>
      <table>
        <thead><tr><th>Admission #</th><th>Student Name</th><th>Form</th><th>Verification Code</th></tr></thead>
        <tbody>${activeCodes.map((c) => `
          <tr>
            <td>${c.student?.admission_number || ""}</td>
            <td>${c.student?.full_name || ""}</td>
            <td>${c.student?.form || ""}</td>
            <td class="code">${c.code}</td>
          </tr>`).join("")}
        </tbody>
      </table>
      </body></html>
    `;
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(printContent);
      win.document.close();
      win.print();
    }
  };

  const activeCodes = codes.filter((c) => getStatus(c) === "active").length;
  const usedCodes = codes.filter((c) => getStatus(c) === "used").length;
  const expiredCodes = codes.filter((c) => getStatus(c) === "expired").length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-none shadow-maroon">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <KeyRound className="h-5 w-5 text-green-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-700">{activeCodes}</p>
              <p className="text-xs text-muted-foreground">Active Codes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-maroon">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Users className="h-5 w-5 text-blue-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-700">{usedCodes}</p>
              <p className="text-xs text-muted-foreground">Used (Linked)</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-maroon">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
              <RefreshCw className="h-5 w-5 text-orange-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-700">{expiredCodes}</p>
              <p className="text-xs text-muted-foreground">Expired</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, admission # or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterForm} onValueChange={setFilterForm}>
            <SelectTrigger className="w-32"><SelectValue placeholder="Form" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Forms</SelectItem>
              {formOptions.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-28"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="used">Used</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { setBulkOpen(true); setBulkResults(null); }}>
            <Users className="mr-1 h-4 w-4" /> Bulk Generate
          </Button>
          <Button variant="outline" size="sm" onClick={printCodes}>
            <Printer className="mr-1 h-4 w-4" /> Print
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportCSV(filtered, `verification-codes-${format(new Date(), "yyyy-MM-dd")}.csv`)}>
            <Download className="mr-1 h-4 w-4" /> Export CSV
          </Button>
          <Button variant="ghost" size="sm" onClick={fetchCodes}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Codes Table */}
      <Card>
        <CardContent className="p-0">
          <div className="max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Admission #</TableHead>
                  <TableHead>Form</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No verification codes found. Use "Bulk Generate" to create codes for students.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((c) => {
                    const status = getStatus(c);
                    return (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium text-sm">{c.student?.full_name || "—"}</TableCell>
                        <TableCell className="font-mono text-xs">{c.student?.admission_number || "—"}</TableCell>
                        <TableCell className="text-sm">{c.student?.form || "—"}</TableCell>
                        <TableCell>
                          <code className="rounded bg-muted px-2 py-0.5 text-sm font-mono font-bold tracking-widest">
                            {c.code}
                          </code>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={status === "active" ? "default" : "secondary"}
                            className={
                              status === "active"
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : status === "used"
                                ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                                : "bg-orange-100 text-orange-800 hover:bg-orange-100"
                            }
                          >
                            {status === "active" ? "Active" : status === "used" ? "Used" : "Expired"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {format(new Date(c.created_at), "dd MMM yyyy")}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {format(new Date(c.expires_at), "dd MMM yyyy")}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {status === "active" && (
                              <Button variant="ghost" size="icon" onClick={() => copyCode(c.code)} title="Copy code">
                                <Copy className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            {(status === "expired" || status === "used") && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => generateSingleCode(c.student_id)}
                                title="Generate new code"
                              >
                                <RefreshCw className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Generate Dialog */}
      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">Bulk Generate Verification Codes</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Generate parent-linking codes for all students in a form and export or print them for distribution.
          </p>
          <div className="flex items-end gap-3">
            <div className="space-y-1 flex-1">
              <Label>Filter by Form</Label>
              <Select value={bulkForm} onValueChange={setBulkForm}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Forms</SelectItem>
                  {formOptions.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={bulkGenerate} disabled={generating}>
              {generating ? "Generating..." : "Generate All"}
            </Button>
          </div>
          {bulkResults && (
            <div className="space-y-3 mt-2">
              <div className="flex items-center justify-between">
                <Badge variant="default" className="text-xs">
                  {bulkResults.filter((r: any) => r.code).length} codes generated
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportCSV(bulkResults.map((r: any) => ({ ...r, student: r })), `bulk-codes-${format(new Date(), "yyyy-MM-dd")}.csv`)}
                >
                  <Download className="mr-1 h-4 w-4" /> Export CSV
                </Button>
              </div>
              <div className="max-h-60 overflow-y-auto rounded border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Adm #</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Form</TableHead>
                      <TableHead>Code</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bulkResults.map((r: any, i: number) => (
                      <TableRow key={i}>
                        <TableCell className="font-mono text-xs">{r.admission_number}</TableCell>
                        <TableCell className="text-sm">{r.full_name}</TableCell>
                        <TableCell className="text-sm">{r.form}</TableCell>
                        <TableCell>
                          {r.code ? (
                            <div className="flex items-center gap-1">
                              <code className="rounded bg-muted px-2 py-0.5 text-xs font-mono font-bold tracking-wider">{r.code}</code>
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyCode(r.code)}>
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-destructive">Error</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

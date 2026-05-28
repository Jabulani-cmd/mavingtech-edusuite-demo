// @ts-nocheck
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check, Sparkles, Smartphone, Building2, CreditCard, ArrowLeft,
  Loader2, ShieldCheck, AlertCircle, Phone, Upload, Receipt, Crown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { useExchangeRate } from "@/hooks/useExchangeRate";
import { downloadSubscriptionReceipt } from "@/lib/receiptPdf";

type Step = "plans" | "method" | "mobile" | "bank" | "redirect" | "success";

const METHOD_LABEL: Record<string, string> = {
  ecocash: "EcoCash", onemoney: "OneMoney", telecash: "Telecash",
  paynow_web: "Paynow (Card / Web)", bank_transfer: "Bank Transfer / ZIPIT",
  visa_mastercard: "Visa / Mastercard",
};

const PREFIX = { ecocash: ["077", "078"], onemoney: ["071"], telecash: ["073"] };

function validateNumber(method: string, num: string) {
  const n = num.replace(/\s|-/g, "");
  if (!/^\d{10}$/.test(n)) return "Enter a 10-digit number (e.g. 0771234567).";
  const allow = PREFIX[method] || [];
  if (allow.length && !allow.some((p) => n.startsWith(p))) {
    return `Number must start with ${allow.join(" or ")} for ${METHOD_LABEL[method]}.`;
  }
  return null;
}

export default function ParentSubscribe() {
  const nav = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const sub = useSubscription();

  const [plans, setPlans] = useState<any[]>([]);
  const [rate, setRate] = useState<number>(350);
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [bank, setBank] = useState<any>(null);

  const [step, setStep] = useState<Step>("plans");
  const [plan, setPlan] = useState<any | null>(null);
  const [method, setMethod] = useState<string>("ecocash");
  const [mobile, setMobile] = useState("");
  const [proof, setProof] = useState<File | null>(null);
  const [countdown, setCountdown] = useState(120);
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // ── load reference data ───────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const [{ data: p }, { data: r }, { data: b }] = await Promise.all([
        supabase.from("subscription_plans").select("*").eq("is_active", true).order("amount_usd"),
        supabase.from("exchange_rates").select("*").eq("is_active", true).order("fetched_at", { ascending: false }).limit(1),
        supabase.from("school_bank_details").select("*").eq("is_active", true).maybeSingle(),
      ]);
      setPlans(p || []);
      if (r?.[0]) setRate(Number(r[0].usd_to_zwg));
      setBank(b);

      // children linked to this parent
      if (user) {
        const { data: kids } = await supabase
          .from("parent_student_links")
          .select("student_id, students:student_id(id, full_name, form, stream, admission_number)")
          .eq("parent_id", user.id);
        const list = (kids || []).map((k: any) => k.students).filter(Boolean);
        // fallback: treat self as "the child" if no links
        if (!list.length) {
          list.push({ id: user.id, full_name: user.email?.split("@")[0] || "Your child", form: "—" });
        }
        setChildren(list);
        setSelectedChild(list[0]?.id || null);
      }
    })();
  }, [user]);

  // mobile money countdown simulation
  useEffect(() => {
    if (step !== "mobile" || !processing) return;
    if (countdown <= 0) {
      // auto-complete success at 0 — demo mode
      finalize(true);
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [step, processing, countdown]);

  const zwg = (usd: number) => (usd * rate).toLocaleString("en-ZW", { maximumFractionDigits: 0 });
  const childName = useMemo(
    () => children.find((c) => c.id === selectedChild)?.full_name || "your child",
    [children, selectedChild],
  );

  // ── flow handlers ─────────────────────────────────────────────────────
  function pickPlan(p: any) {
    setPlan(p);
    setStep("method");
  }

  function pickMethod(m: string) {
    setMethod(m);
    setError(null);
    if (["ecocash", "onemoney", "telecash"].includes(m)) setStep("mobile");
    else if (m === "bank_transfer") setStep("bank");
    else setStep("redirect");
  }

  async function startMobilePayment() {
    const err = validateNumber(method, mobile);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setProcessing(true);
    setCountdown(8); // demo: confirm in 8s instead of 2 min
    toast({ title: "USSD push sent", description: `Approve on ${mobile} to complete payment.` });
  }

  async function startWebRedirect() {
    setProcessing(true);
    // simulate Paynow round-trip
    setTimeout(() => finalize(true), 2500);
  }

  async function submitBankTransfer() {
    if (!proof) {
      setError("Upload your proof of payment first.");
      return;
    }
    setError(null);
    setProcessing(true);
    await createPayment("awaiting_verification", "pending");
    setProcessing(false);
    toast({
      title: "Submitted for verification",
      description: "An administrator will verify your transfer shortly.",
    });
    nav("/portal/parent/payments");
  }

  async function createPayment(paymentStatus: string, subStatus: string) {
    const accessStart = new Date();
    const accessEnd = new Date(accessStart.getTime() + plan.duration_days * 86_400_000);
    const txId = "DEMO-" + Date.now().toString(36).toUpperCase();
    const receiptNumber = "MTR-" + Math.floor(100000 + Math.random() * 900000);

    const { data: subRow, error: subErr } = await supabase
      .from("subscriptions")
      .insert({
        parent_id: user.id,
        student_id: selectedChild,
        plan_id: plan.id,
        plan_type: plan.plan_type,
        amount_usd: plan.amount_usd,
        amount_zwg: Number(plan.amount_usd) * rate,
        currency_paid: "USD",
        payment_method: method,
        transaction_id: txId,
        status: subStatus,
        access_start: subStatus === "active" ? accessStart.toISOString() : null,
        access_end: subStatus === "active" ? accessEnd.toISOString() : null,
        term: "Term " + (Math.floor(new Date().getMonth() / 4) + 1),
        academic_year: new Date().getFullYear().toString(),
      })
      .select()
      .single();

    if (subErr) throw subErr;

    const { data: payRow } = await supabase
      .from("payments")
      .insert({
        subscription_id: subRow.id,
        parent_id: user.id,
        amount: plan.amount_usd,
        currency: "USD",
        payment_method: method,
        mobile_number: mobile || null,
        transaction_id: txId,
        receipt_number: receiptNumber,
        payment_status: paymentStatus,
      })
      .select()
      .single();

    if (subStatus === "active") {
      await supabase.from("access_grants").insert({
        parent_id: user.id,
        student_id: selectedChild,
        grant_type: "paid",
        access_start: accessStart.toISOString(),
        access_end: accessEnd.toISOString(),
        subscription_id: subRow.id,
        is_active: true,
      });
    }

    return { subRow, payRow, receiptNumber, accessStart, accessEnd, txId };
  }

  async function finalize(success: boolean) {
    if (!success) {
      setProcessing(false);
      setError("Payment failed or cancelled. Please try again.");
      return;
    }
    try {
      const result = await createPayment("paid", "active");
      setCompleted({ ...result, plan, method, childName });
      setStep("success");
      sub.refresh();
      toast({ title: "Payment successful 🎉", description: "Portal access activated." });
    } catch (e: any) {
      setError(e.message || "Failed to record payment.");
    } finally {
      setProcessing(false);
    }
  }

  // ── render ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-blue-50/30 dark:from-slate-950 dark:via-teal-950/20 dark:to-blue-950/20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => (step === "plans" ? nav(-1) : setStep("plans"))} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        {/* Hero */}
        <div className="text-center mb-8">
          <Badge variant="outline" className="mb-3 border-teal-500/40 text-teal-700 dark:text-teal-300">
            <Sparkles className="w-3 h-3 mr-1" /> Parent Portal Access
          </Badge>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            Unlock access for <span className="text-teal-600">{childName}</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose a plan to give your family full access to the timetable, results, lesson plans, attendance, and direct teacher messaging.
          </p>
        </div>

        {/* Child selector */}
        {children.length > 1 && step === "plans" && (
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {children.map((c) => (
              <Button
                key={c.id}
                size="sm"
                variant={selectedChild === c.id ? "default" : "outline"}
                onClick={() => setSelectedChild(c.id)}
              >
                {c.full_name}
              </Button>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === "plans" && <PlansView plans={plans} rate={rate} onPick={pickPlan} />}
          {step === "method" && (
            <MethodView plan={plan} rate={rate} onPick={pickMethod} />
          )}
          {step === "mobile" && (
            <MobileView
              method={method}
              mobile={mobile}
              setMobile={setMobile}
              error={error}
              processing={processing}
              countdown={countdown}
              onStart={startMobilePayment}
              plan={plan}
              rate={rate}
            />
          )}
          {step === "bank" && (
            <BankView
              bank={bank}
              proof={proof}
              setProof={setProof}
              onSubmit={submitBankTransfer}
              processing={processing}
              error={error}
              plan={plan}
            />
          )}
          {step === "redirect" && (
            <RedirectView method={method} plan={plan} processing={processing} onStart={startWebRedirect} />
          )}
          {step === "success" && completed && (
            <SuccessView
              data={completed}
              onDownload={() =>
                downloadSubscriptionReceipt({
                  receiptNumber: completed.receiptNumber,
                  parentName: user?.email || "Parent",
                  studentName: completed.childName,
                  amount: Number(completed.plan.amount_usd),
                  currency: "USD",
                  method: METHOD_LABEL[completed.method],
                  transactionId: completed.txId,
                  plan: completed.plan.name,
                  accessStart: completed.accessStart,
                  accessEnd: completed.accessEnd,
                  date: new Date(),
                })
              }
              onPortal={() => nav("/portal/parent")}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Step views
// ──────────────────────────────────────────────────────────────────────────

function PlansView({ plans, rate, onPick }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      {plans.map((p) => (
        <Card key={p.id} className={`relative overflow-hidden ${p.is_recommended ? "border-teal-500 border-2 shadow-xl" : ""}`}>
          {p.is_recommended && (
            <div className="absolute top-0 right-0 bg-gradient-to-r from-teal-500 to-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
              <Crown className="w-3 h-3" /> BEST VALUE — SAVE $5
            </div>
          )}
          <CardContent className="p-7">
            <h3 className="text-2xl font-bold font-display">{p.name}</h3>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-bold">${Number(p.amount_usd).toFixed(0)}</span>
              <span className="text-muted-foreground">/ {p.plan_type === "monthly" ? "month" : "term"}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              ~ZWG {(Number(p.amount_usd) * rate).toLocaleString("en-ZW", { maximumFractionDigits: 0 })} at today's rate
            </p>
            <p className="text-sm mt-3">{p.description}</p>

            <ul className="mt-5 space-y-2">
              {(p.features || []).slice(0, 10).map((f: string) => (
                <li key={f} className="flex gap-2 text-sm">
                  <Check className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <Button
              className={`w-full mt-6 ${p.is_recommended ? "bg-gradient-to-r from-teal-600 to-blue-700 hover:opacity-90" : ""}`}
              size="lg"
              onClick={() => onPick(p)}
            >
              Choose {p.name}
            </Button>
          </CardContent>
        </Card>
      ))}
    </motion.div>
  );
}

function MethodView({ plan, rate, onPick }: any) {
  const methods = [
    { id: "ecocash", label: "EcoCash", icon: Smartphone, note: "Econet 077X / 078X" },
    { id: "onemoney", label: "OneMoney", icon: Smartphone, note: "NetOne 071X" },
    { id: "telecash", label: "Telecash", icon: Smartphone, note: "Telecel 073X" },
    { id: "paynow_web", label: "Paynow Web", icon: CreditCard, note: "All cards & mobile" },
    { id: "bank_transfer", label: "Bank Transfer / ZIPIT", icon: Building2, note: "Manual verification" },
    { id: "visa_mastercard", label: "Visa / Mastercard", icon: CreditCard, note: "Diaspora friendly" },
  ];
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-3xl mx-auto">
      <Card className="p-6 mb-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="text-sm text-muted-foreground">Selected plan</div>
            <div className="font-semibold text-lg">{plan.name}</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">${Number(plan.amount_usd).toFixed(2)} USD</div>
            <div className="text-xs text-muted-foreground">~ZWG {(Number(plan.amount_usd) * rate).toLocaleString("en-ZW", { maximumFractionDigits: 0 })}</div>
          </div>
        </div>
      </Card>

      <h3 className="font-semibold text-lg mb-3">Choose a payment method</h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {methods.map((m) => (
          <button
            key={m.id}
            onClick={() => onPick(m.id)}
            className="p-5 rounded-xl border-2 border-border hover:border-teal-500 hover:bg-teal-50/40 dark:hover:bg-teal-950/20 transition text-left group"
          >
            <m.icon className="w-7 h-7 mb-2 text-teal-600 group-hover:scale-110 transition" />
            <div className="font-semibold">{m.label}</div>
            <div className="text-xs text-muted-foreground">{m.note}</div>
          </button>
        ))}
      </div>
      <div className="text-xs text-muted-foreground flex items-center gap-2 mt-4">
        <ShieldCheck className="w-4 h-4" /> Payments are processed securely. Demo environment — no real money is moved.
      </div>
    </motion.div>
  );
}

function MobileView({ method, mobile, setMobile, error, processing, countdown, onStart, plan, rate }: any) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-md mx-auto">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Phone className="w-5 h-5 text-teal-600" />
          <h3 className="font-semibold text-lg">{METHOD_LABEL[method]} Payment</h3>
        </div>

        {!processing ? (
          <>
            <Label className="text-sm">Your registered mobile number</Label>
            <Input
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder={method === "ecocash" ? "0771234567" : method === "onemoney" ? "0712345678" : "0731234567"}
              className="mt-1"
            />
            {error && (
              <div className="text-xs text-destructive flex items-center gap-1 mt-2">
                <AlertCircle className="w-3 h-3" /> {error}
              </div>
            )}
            <div className="text-sm bg-muted/40 rounded-lg p-3 my-4">
              You will be charged <strong>${Number(plan.amount_usd).toFixed(2)} USD</strong>{" "}
              (~ZWG {(Number(plan.amount_usd) * rate).toLocaleString("en-ZW", { maximumFractionDigits: 0 })}). A USSD prompt will arrive on your phone.
            </div>
            <Button className="w-full" size="lg" onClick={onStart}>
              Send Payment Request
            </Button>
          </>
        ) : (
          <div className="text-center py-6">
            <Loader2 className="w-10 h-10 animate-spin mx-auto text-teal-600" />
            <div className="font-medium mt-4">Waiting for payment confirmation…</div>
            <div className="text-sm text-muted-foreground mt-1">Approve the USSD prompt on {mobile}</div>
            <div className="mt-4">
              <Progress value={((120 - countdown) / 120) * 100} />
              <div className="text-xs text-muted-foreground mt-2">
                Auto-confirms in {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, "0")}
              </div>
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

function BankView({ bank, proof, setProof, onSubmit, processing, error, plan }: any) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-xl mx-auto">
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-teal-600" /> Bank Transfer / ZIPIT
        </h3>
        {bank && (
          <div className="bg-muted/40 rounded-lg p-4 space-y-1 text-sm">
            <div><span className="text-muted-foreground">Bank:</span> <strong>{bank.bank_name}</strong></div>
            <div><span className="text-muted-foreground">Account Name:</span> <strong>{bank.account_name}</strong></div>
            <div><span className="text-muted-foreground">Account #:</span> <strong>{bank.account_number}</strong></div>
            {bank.branch && <div><span className="text-muted-foreground">Branch:</span> {bank.branch}</div>}
            {bank.swift_code && <div><span className="text-muted-foreground">SWIFT:</span> {bank.swift_code}</div>}
            <div><span className="text-muted-foreground">Reference:</span> <strong>PARENT-{plan.plan_type.toUpperCase()}</strong></div>
            <div className="pt-2 border-t mt-2"><span className="text-muted-foreground">Amount:</span> <strong>${Number(plan.amount_usd).toFixed(2)} USD</strong></div>
          </div>
        )}

        <div className="mt-5">
          <Label>Upload proof of payment</Label>
          <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center hover:border-teal-500 transition">
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setProof(e.target.files?.[0] || null)}
              className="hidden"
              id="proof-upload"
            />
            <label htmlFor="proof-upload" className="cursor-pointer">
              <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <div className="text-sm">{proof ? proof.name : "Click to upload screenshot or PDF"}</div>
            </label>
          </div>
          {error && (
            <div className="text-xs text-destructive flex items-center gap-1 mt-2">
              <AlertCircle className="w-3 h-3" /> {error}
            </div>
          )}
        </div>

        <Button className="w-full mt-5" size="lg" onClick={onSubmit} disabled={processing}>
          {processing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Submit for Verification
        </Button>
      </Card>
    </motion.div>
  );
}

function RedirectView({ method, plan, processing, onStart }: any) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-md mx-auto">
      <Card className="p-6 text-center">
        <CreditCard className="w-12 h-12 mx-auto mb-3 text-teal-600" />
        <h3 className="font-semibold text-lg">{METHOD_LABEL[method]}</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-5">
          You will be redirected to a secure payment page to complete your ${Number(plan.amount_usd).toFixed(2)} USD payment.
        </p>
        {processing ? (
          <div className="py-3">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-teal-600" />
            <div className="text-sm mt-2">Connecting to payment gateway…</div>
          </div>
        ) : (
          <Button size="lg" className="w-full" onClick={onStart}>
            Continue to Payment Page
          </Button>
        )}
      </Card>
    </motion.div>
  );
}

function SuccessView({ data, onDownload, onPortal }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto text-center"
    >
      <Card className="p-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.1 }}
          className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4"
        >
          <Check className="w-10 h-10 text-white" strokeWidth={3} />
        </motion.div>
        <h2 className="text-2xl font-bold font-display mb-1">Payment Successful 🎉</h2>
        <p className="text-muted-foreground text-sm mb-5">Portal access activated for {data.childName}.</p>

        <div className="bg-muted/40 rounded-lg p-4 text-left text-sm space-y-1">
          <div className="flex justify-between"><span className="text-muted-foreground">Receipt</span> <strong>{data.receiptNumber}</strong></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Plan</span> <strong>{data.plan.name}</strong></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Amount</span> <strong>${Number(data.plan.amount_usd).toFixed(2)} USD</strong></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Method</span> <strong>{METHOD_LABEL[data.method]}</strong></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Access until</span> <strong>{new Date(data.accessEnd).toLocaleDateString()}</strong></div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-5">
          <Button variant="outline" onClick={onDownload}>
            <Receipt className="w-4 h-4 mr-2" /> Download Receipt
          </Button>
          <Button onClick={onPortal} className="bg-gradient-to-r from-teal-600 to-blue-700 hover:opacity-90">
            Go to Portal
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

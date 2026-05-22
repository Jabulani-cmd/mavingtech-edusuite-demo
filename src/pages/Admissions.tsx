import { useState } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import PageHero from "@/components/layout/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, FileText, Users, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import hero from "@/assets/hero-students-4.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6 } }),
};

const steps = [
  { icon: FileText, title: "Submit Application", desc: "Complete the online form with student and parent details." },
  { icon: Calendar, title: "Entrance Assessment", desc: "Shortlisted applicants are invited for an assessment." },
  { icon: Users, title: "Interview", desc: "Meet with the admissions team and tour the campus." },
  { icon: CheckCircle, title: "Acceptance", desc: "Successful candidates receive an offer letter." },
];

export default function Admissions() {
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    toast({ title: "Application Submitted!", description: "We will be in touch shortly." });
  };

  return (
    <Layout>
      <PageHero
        eyebrow="Join Our Community"
        title="Admissions"
        subtitle="Join the MavingTech family. We welcome students who are eager to learn, grow and contribute to our vibrant community."
        image={hero}
      />

      {/* Process */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="mb-14 text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">How to Apply</span>
            <h2 className="mt-3 font-heading text-3xl font-bold text-foreground md:text-5xl">Admission Process</h2>
            <div className="mx-auto mt-4 h-[3px] w-12 bg-primary" />
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <motion.div
                key={s.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="relative rounded-lg bg-card p-6 shadow-sm ring-1 ring-border/60"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <s.icon className="h-6 w-6 text-primary" />
                </div>
                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Step {i + 1}</p>
                <h3 className="mt-2 font-heading text-lg font-bold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="bg-muted/40 py-20 md:py-28">
        <div className="container max-w-2xl">
          <div className="mb-10 text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Begin Your Journey</span>
            <h2 className="mt-3 font-heading text-3xl font-bold text-foreground md:text-4xl">Online Application</h2>
            <div className="mx-auto mt-4 h-[3px] w-12 bg-primary" />
          </div>
          <div className="rounded-lg bg-card p-8 shadow-sm ring-1 ring-border/60 md:p-10">
            {submitted ? (
              <div className="py-12 text-center">
                <CheckCircle className="mx-auto mb-4 h-16 w-16 text-primary" />
                <h3 className="font-heading text-xl font-bold text-foreground">Application Received!</h3>
                <p className="mt-2 text-muted-foreground">Thank you for applying to MavingTech High School. We will contact you within 5 business days.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Student First Name *</Label>
                    <Input id="firstName" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Student Last Name *</Label>
                    <Input id="lastName" required />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth *</Label>
                    <Input id="dob" type="date" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="grade">Applying for Grade *</Label>
                    <Select required>
                      <SelectTrigger><SelectValue placeholder="Select grade" /></SelectTrigger>
                      <SelectContent>
                        {["Form 1", "Form 2", "Form 3", "Form 4", "Lower 6", "Upper 6"].map(g => (
                          <SelectItem key={g} value={g}>{g}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prevSchool">Previous School</Label>
                  <Input id="prevSchool" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="parentName">Parent/Guardian Name *</Label>
                    <Input id="parentName" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parentPhone">Parent Phone *</Label>
                    <Input id="parentPhone" type="tel" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parentEmail">Parent Email *</Label>
                  <Input id="parentEmail" type="email" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea id="notes" rows={3} />
                </div>
                <Button type="submit" size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Submit Application
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}

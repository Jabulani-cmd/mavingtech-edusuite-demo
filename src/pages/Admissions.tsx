import { useState } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, FileText, Users, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
      {/* Hero */}
      <section className="bg-secondary py-16">
        <div className="container">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-heading text-4xl font-bold text-secondary-foreground">
            Admissions
          </motion.h1>
          <p className="mt-3 max-w-xl text-primary-foreground/80">
            Join the MavingTech family. We welcome students who are eager to learn, grow, and contribute to our vibrant community.
          </p>
        </div>
      </section>

      {/* Process */}
      <section className="py-16">
        <div className="container">
          <h2 className="mb-8 font-heading text-2xl font-bold text-primary">Admission Process</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}>
                <Card className="h-full border-none shadow-maroon">
                  <CardContent className="p-6 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-maroon-light">
                      <s.icon className="h-6 w-6 text-primary" />
                    </div>
                    <p className="mb-1 text-xs font-bold uppercase tracking-wider text-accent">Step {i + 1}</p>
                    <h3 className="font-heading font-semibold">{s.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="bg-section-warm py-16">
        <div className="container max-w-2xl">
          <Card className="shadow-maroon">
            <CardHeader>
              <CardTitle className="font-heading text-2xl text-primary">Online Application</CardTitle>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <div className="py-12 text-center">
                  <CheckCircle className="mx-auto mb-4 h-16 w-16 text-primary" />
                  <h3 className="font-heading text-xl font-bold">Application Received!</h3>
                  <p className="mt-2 text-muted-foreground">Thank you for applying to MavingTech Business Solutions. We will contact you within 5 business days.</p>
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
                  <Button type="submit" size="lg" className="w-full">Submit Application</Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}

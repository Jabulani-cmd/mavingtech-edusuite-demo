// @ts-nocheck
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, CalendarIcon, Send, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  subject: z.string().trim().max(200).optional(),
  message: z.string().trim().min(1, "Message is required").max(2000),
});

const appointmentSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().max(20).optional(),
  authority: z.string().min(1, "Please select an authority"),
  department: z.string().optional(),
  preferred_date: z.date({ required_error: "Please select a date" }),
  preferred_time: z.string().min(1, "Please select a time"),
  reason: z.string().trim().min(1, "Please provide a reason").max(1000),
});

type ContactForm = z.infer<typeof contactSchema>;
type AppointmentForm = z.infer<typeof appointmentSchema>;

const authorities = [
  "Principal — Mrs. B. Dewa",
  "Deputy Principal",
  "Head of Department — Sciences",
  "Head of Department — Languages",
  "Head of Department — Humanities",
  "Head of Department — Commercials",
  "Senior Teacher",
  "Bursar / Finance",
  "Admissions Office",
];

const timeSlots = [
  "08:00 - 08:30", "08:30 - 09:00", "09:00 - 09:30", "09:30 - 10:00",
  "10:00 - 10:30", "10:30 - 11:00", "11:00 - 11:30", "11:30 - 12:00",
  "13:00 - 13:30", "13:30 - 14:00", "14:00 - 14:30", "14:30 - 15:00",
];

export default function Contact() {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") === "appointment" ? "appointment" : "contact";
  const [contactSent, setContactSent] = useState(false);
  const [appointmentSent, setAppointmentSent] = useState(false);

  const contactForm = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", subject: "", message: "" },
  });

  const appointmentForm = useForm<AppointmentForm>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: { name: "", email: "", phone: "", authority: "", department: "", reason: "", preferred_time: "" },
  });

  const onContactSubmit = async (data: ContactForm) => {
    const { error } = await supabase.from("contact_messages").insert({
      name: data.name,
      email: data.email,
      subject: data.subject || null,
      message: data.message,
    });
    if (error) {
      toast({ title: "Error", description: "Failed to send message. Please try again.", variant: "destructive" });
    } else {
      setContactSent(true);
      contactForm.reset();
    }
  };

  const onAppointmentSubmit = async (data: AppointmentForm) => {
    const { error } = await supabase.from("appointments" as any).insert({
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      authority: data.authority,
      department: data.department || null,
      preferred_date: format(data.preferred_date, "yyyy-MM-dd"),
      preferred_time: data.preferred_time,
      reason: data.reason,
    } as any);
    if (error) {
      toast({ title: "Error", description: "Failed to submit appointment request. Please try again.", variant: "destructive" });
    } else {
      setAppointmentSent(true);
      appointmentForm.reset();
    }
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-maroon-gradient py-16">
        <div className="container text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-heading text-4xl font-bold text-primary-foreground md:text-5xl">
            Contact Us
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mx-auto mt-4 max-w-2xl text-primary-foreground/80">
            We'd love to hear from you. Reach out with questions or book an appointment with our school authorities.
          </motion.p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="bg-section-warm py-12">
        <div className="container grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: MapPin, title: "Address", text: "Gifford High School, Bulawayo, Zimbabwe" },
            { icon: Phone, title: "Phone", text: "+263 29 2XXXXXX" },
            { icon: Mail, title: "Email", text: "info@giffordhigh.ac.zw" },
            { icon: Clock, title: "Office Hours", text: "Mon – Fri: 07:30 – 15:30" },
          ].map((item, i) => (
            <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <Card className="h-full border-none shadow-maroon text-center">
                <CardContent className="flex flex-col items-center p-6">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-heading font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{item.text}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Forms */}
      <section className="py-16">
        <div className="container max-w-4xl">
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="contact">Send a Message</TabsTrigger>
              <TabsTrigger value="appointment">Book an Appointment</TabsTrigger>
            </TabsList>

            {/* Contact Form */}
            <TabsContent value="contact">
              <Card className="border-none shadow-maroon">
                <CardHeader>
                  <CardTitle className="font-heading">Send Us a Message</CardTitle>
                </CardHeader>
                <CardContent>
                  {contactSent ? (
                    <div className="flex flex-col items-center gap-4 py-12 text-center">
                      <CheckCircle className="h-16 w-16 text-secondary" />
                      <h3 className="font-heading text-xl font-semibold">Message Sent!</h3>
                      <p className="text-muted-foreground">Thank you for reaching out. We'll respond as soon as possible.</p>
                      <Button onClick={() => setContactSent(false)} variant="outline">Send Another</Button>
                    </div>
                  ) : (
                    <Form {...contactForm}>
                      <form onSubmit={contactForm.handleSubmit(onContactSubmit)} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <FormField control={contactForm.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Full Name *</FormLabel><FormControl><Input placeholder="Your name" {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField control={contactForm.control} name="email" render={({ field }) => (
                            <FormItem><FormLabel>Email *</FormLabel><FormControl><Input type="email" placeholder="your@email.com" {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                        </div>
                        <FormField control={contactForm.control} name="subject" render={({ field }) => (
                          <FormItem><FormLabel>Subject</FormLabel><FormControl><Input placeholder="What is this about?" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={contactForm.control} name="message" render={({ field }) => (
                          <FormItem><FormLabel>Message *</FormLabel><FormControl><Textarea placeholder="Write your message..." className="min-h-[120px]" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <Button type="submit" disabled={contactForm.formState.isSubmitting} className="bg-primary text-primary-foreground hover:bg-primary/90">
                          <Send className="mr-2 h-4 w-4" /> {contactForm.formState.isSubmitting ? "Sending..." : "Send Message"}
                        </Button>
                      </form>
                    </Form>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Appointment Form */}
            <TabsContent value="appointment">
              <Card className="border-none shadow-maroon">
                <CardHeader>
                  <CardTitle className="font-heading">Book an Appointment</CardTitle>
                  <p className="text-sm text-muted-foreground">Schedule a meeting with school authorities. We will confirm your appointment via email.</p>
                </CardHeader>
                <CardContent>
                  {appointmentSent ? (
                    <div className="flex flex-col items-center gap-4 py-12 text-center">
                      <CheckCircle className="h-16 w-16 text-secondary" />
                      <h3 className="font-heading text-xl font-semibold">Appointment Request Submitted!</h3>
                      <p className="text-muted-foreground">We'll review your request and confirm via email. Please allow 1-2 business days.</p>
                      <Button onClick={() => setAppointmentSent(false)} variant="outline">Book Another</Button>
                    </div>
                  ) : (
                    <Form {...appointmentForm}>
                      <form onSubmit={appointmentForm.handleSubmit(onAppointmentSubmit)} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <FormField control={appointmentForm.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Full Name *</FormLabel><FormControl><Input placeholder="Your name" {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField control={appointmentForm.control} name="email" render={({ field }) => (
                            <FormItem><FormLabel>Email *</FormLabel><FormControl><Input type="email" placeholder="your@email.com" {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                        </div>
                        <FormField control={appointmentForm.control} name="phone" render={({ field }) => (
                          <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="+263..." {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <div className="grid gap-4 sm:grid-cols-2">
                          <FormField control={appointmentForm.control} name="authority" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Who would you like to see? *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select authority" /></SelectTrigger></FormControl>
                                <SelectContent>
                                  {authorities.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={appointmentForm.control} name="department" render={({ field }) => (
                            <FormItem><FormLabel>Department (optional)</FormLabel><FormControl><Input placeholder="e.g. Sciences, Admin" {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <FormField control={appointmentForm.control} name="preferred_date" render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Preferred Date *</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                      {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6}
                                    initialFocus
                                    className={cn("p-3 pointer-events-auto")}
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={appointmentForm.control} name="preferred_time" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Preferred Time *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select time slot" /></SelectTrigger></FormControl>
                                <SelectContent>
                                  {timeSlots.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>
                        <FormField control={appointmentForm.control} name="reason" render={({ field }) => (
                          <FormItem><FormLabel>Reason for Visit *</FormLabel><FormControl><Textarea placeholder="Briefly describe the purpose of your visit..." className="min-h-[100px]" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <Button type="submit" disabled={appointmentForm.formState.isSubmitting} className="bg-primary text-primary-foreground hover:bg-primary/90">
                          <CalendarIcon className="mr-2 h-4 w-4" /> {appointmentForm.formState.isSubmitting ? "Submitting..." : "Request Appointment"}
                        </Button>
                      </form>
                    </Form>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
}

// @ts-nocheck
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Music, BookOpen, Palette, Users, Volleyball, HandshakeIcon, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const sports = [
  { name: "Rugby", desc: "Provincial champions 2024. U-16 and 1st XV teams." },
  { name: "Soccer", desc: "Boys and girls teams compete in the Inter-Schools League." },
  { name: "Athletics", desc: "Track & field, cross-country, and inter-house competitions." },
  { name: "Swimming", desc: "Annual galas and inter-school relay events." },
  { name: "Cricket", desc: "Boys 1st XI competing at provincial level." },
  { name: "Netball", desc: "Girls teams representing at national level." },
];

const clubs = [
  { icon: Music, name: "Choir & Music", desc: "Award-winning choir performing at national festivals." },
  { icon: Palette, name: "Drama Club", desc: "Annual productions and inter-school drama competitions." },
  { icon: BookOpen, name: "Debate Society", desc: "Critical thinking and public speaking development." },
  { icon: Users, name: "Community Service", desc: "Outreach programmes and environmental conservation." },
  { icon: Volleyball, name: "Chess Club", desc: "Strategic thinking — provincial finalists 2025." },
  { icon: Trophy, name: "Science Club", desc: "Hands-on experiments and science olympiads." },
];

const meetingTypeLabels: Record<string, string> = { sdc: "SDC Meeting", "parent-teacher": "Parent-Teacher Meeting", general: "General" };

export default function SchoolLife() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [galleryImages, setGalleryImages] = useState<{ id: string; image_url: string; caption: string | null }[]>([]);

  useEffect(() => {
    supabase.from("meetings").select("*").order("meeting_date", { ascending: true })
      .then(({ data }) => { if (data) setMeetings(data); });

    supabase.from("gallery_images").select("id, image_url, caption").eq("is_active", true).order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setGalleryImages(data); });
  }, []);

  const sdcMeetings = meetings.filter(m => m.meeting_type === "sdc");
  const ptMeetings = meetings.filter(m => m.meeting_type === "parent-teacher");

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-secondary py-16">
        <div className="container">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-heading text-4xl font-bold text-secondary-foreground">
            School Life
          </motion.h1>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <Tabs defaultValue="sports">
            <TabsList className="mb-8 flex-wrap">
              <TabsTrigger value="sports">Sports</TabsTrigger>
              <TabsTrigger value="clubs">Clubs & Activities</TabsTrigger>
              <TabsTrigger value="sdc"><HandshakeIcon className="mr-1 h-4 w-4" /> SDC</TabsTrigger>
              <TabsTrigger value="pt-meetings"><Calendar className="mr-1 h-4 w-4" /> Parent-Teacher</TabsTrigger>
              <TabsTrigger value="gallery">Gallery</TabsTrigger>
            </TabsList>

            <TabsContent value="sports">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {sports.map((s, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                    <Card className="h-full transition-shadow hover:shadow-maroon">
                      <CardContent className="p-5">
                        <h3 className="font-heading font-semibold text-primary">{s.name}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="clubs">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {clubs.map((c, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                    <Card className="h-full transition-shadow hover:shadow-maroon">
                      <CardContent className="flex items-start gap-4 p-5">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-maroon-light">
                          <c.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-heading font-semibold">{c.name}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* SDC Tab */}
            <TabsContent value="sdc">
              <div className="mb-6">
                <h2 className="font-heading text-2xl font-bold text-primary mb-2">School Development Committee (SDC)</h2>
                <p className="text-muted-foreground">The SDC represents the interests of parents, staff and the community, working alongside the school administration to ensure a thriving learning environment.</p>
              </div>
              {sdcMeetings.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {sdcMeetings.map((m, i) => (
                    <motion.div key={m.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                      <Card className="h-full transition-shadow hover:shadow-maroon">
                        <CardContent className="p-5">
                          <span className="inline-block rounded-full bg-maroon-light px-2 py-0.5 text-xs font-semibold text-primary mb-2">SDC Meeting</span>
                          <h3 className="font-heading font-semibold">{m.title}</h3>
                          <p className="text-sm text-accent font-medium">{new Date(m.meeting_date).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</p>
                          {m.location && <p className="text-xs text-muted-foreground mt-1">📍 {m.location}</p>}
                          {m.description && <p className="mt-2 text-sm text-muted-foreground">{m.description}</p>}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground italic py-8">No SDC meetings scheduled at this time.</p>
              )}
            </TabsContent>

            {/* Parent-Teacher Tab */}
            <TabsContent value="pt-meetings">
              <div className="mb-6">
                <h2 className="font-heading text-2xl font-bold text-primary mb-2">Parent-Teacher Meetings</h2>
                <p className="text-muted-foreground">Regular meetings between parents and teachers to discuss student progress and development.</p>
              </div>
              {ptMeetings.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {ptMeetings.map((m, i) => (
                    <motion.div key={m.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                      <Card className="h-full transition-shadow hover:shadow-maroon">
                        <CardContent className="p-5">
                          <span className="inline-block rounded-full bg-maroon-light px-2 py-0.5 text-xs font-semibold text-primary mb-2">Parent-Teacher</span>
                          <h3 className="font-heading font-semibold">{m.title}</h3>
                          <p className="text-sm text-accent font-medium">{new Date(m.meeting_date).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</p>
                          {m.location && <p className="text-xs text-muted-foreground mt-1">📍 {m.location}</p>}
                          {m.description && <p className="mt-2 text-sm text-muted-foreground">{m.description}</p>}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground italic py-8">No parent-teacher meetings scheduled at this time.</p>
              )}
            </TabsContent>

            <TabsContent value="gallery">
              {galleryImages.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {galleryImages.map((img, i) => (
                    <motion.div key={img.id} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                      <img src={img.image_url} alt={img.caption || `Gallery ${i + 1}`} className="h-64 w-full rounded-xl object-cover shadow-maroon transition-transform hover:scale-[1.02]" />
                      {img.caption && <p className="mt-2 text-center text-xs text-muted-foreground">{img.caption}</p>}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground italic py-8">Gallery images coming soon.</p>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
}

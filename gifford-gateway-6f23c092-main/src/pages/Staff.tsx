// @ts-nocheck
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import schoolLogo from "@/assets/school-logo.png";

type StaffMember = {
  id: string;
  full_name: string;
  title: string | null;
  department: string | null;
  bio: string | null;
  photo_url: string | null;
  email: string | null;
  category: string;
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const categoryOrder = ["leadership", "teaching", "admin", "general"];
const categoryTitles: Record<string, string> = {
  leadership: "School Leadership",
  teaching: "Teaching Staff",
  admin: "Administrative Staff",
  general: "General Staff",
};

export default function Staff() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [groupPhoto, setGroupPhoto] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("staff")
      .select("id, full_name, title, department, bio, photo_url, email, category")
      .order("full_name")
      .then(({ data }) => { if (data) setStaff(data as StaffMember[]); });

    supabase
      .from("site_settings")
      .select("setting_value")
      .eq("setting_key", "staff_group_photo")
      .limit(1)
      .then(({ data }) => { if (data && data.length > 0) setGroupPhoto(data[0].setting_value); });
  }, []);

  const staffByCategory = categoryOrder
    .map(cat => ({ category: cat, members: staff.filter(s => s.category === cat) }))
    .filter(g => g.members.length > 0);

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-secondary py-16">
        <div className="container">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-heading text-4xl font-bold text-secondary-foreground">
            Our Staff
          </motion.h1>
        </div>
      </section>

      {/* Group Photo */}
      {groupPhoto && (
        <section className="py-12">
          <div className="container max-w-4xl">
            <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
              <img src={groupPhoto} alt="Gifford High School Staff" className="w-full rounded-xl shadow-maroon object-cover" style={{ aspectRatio: "16/9" }} />
              <p className="mt-3 text-center text-sm text-muted-foreground italic">Gifford High School Staff</p>
            </motion.div>
          </div>
        </section>
      )}

      {/* Staff by Category */}
      {staffByCategory.map((group, sectionIdx) => (
        <section key={group.category} className={sectionIdx % 2 === 0 ? "bg-section-warm py-16" : "py-16"}>
          <div className="container">
            <h2 className="mb-10 text-center font-heading text-3xl font-bold text-primary">
              {categoryTitles[group.category]}
            </h2>
            <div className={`grid gap-8 ${group.category === "leadership" ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4"}`}>
              {group.members.map((member, i) => (
                <motion.div key={member.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                  <Card className="h-full border-none shadow-maroon overflow-hidden">
                    {group.category === "leadership" ? (
                      <div className="flex flex-col items-center p-6 text-center">
                        {member.photo_url ? (
                          <img src={member.photo_url} alt={member.full_name} className="mb-4 h-32 w-32 rounded-full object-cover object-top shadow-md" />
                        ) : (
                          <div className="mb-4 flex h-32 w-32 items-center justify-center rounded-full bg-maroon-light">
                            <span className="font-heading text-4xl font-bold text-primary">{member.full_name[0]}</span>
                          </div>
                        )}
                        <h3 className="font-heading text-lg font-bold">{member.full_name}</h3>
                        {member.title && <p className="text-sm font-medium text-accent">{member.title}</p>}
                        {member.department && <p className="text-xs text-muted-foreground">{member.department}</p>}
                        {member.bio && <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{member.bio}</p>}
                      </div>
                    ) : (
                      <>
                        {member.photo_url ? (
                          <div className="relative w-full" style={{ aspectRatio: "3/4" }}>
                            <img src={member.photo_url} alt={member.full_name} className="absolute inset-0 h-full w-full object-cover object-top" />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center bg-maroon-light" style={{ aspectRatio: "3/4" }}>
                            <span className="font-heading text-5xl font-bold text-primary">{member.full_name[0]}</span>
                          </div>
                        )}
                        <CardContent className="p-4">
                          <h3 className="font-heading text-sm font-bold">{member.full_name}</h3>
                          {member.title && <p className="text-xs font-medium text-accent">{member.title}</p>}
                          {member.department && <p className="text-xs text-muted-foreground">{member.department}</p>}
                          {member.bio && <p className="mt-2 text-xs text-muted-foreground line-clamp-3">{member.bio}</p>}
                        </CardContent>
                      </>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {staff.length === 0 && (
        <section className="py-16">
          <div className="container">
            <p className="text-center text-muted-foreground italic">Staff directory coming soon.</p>
          </div>
        </section>
      )}
    </Layout>
  );
}

import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Shield, Utensils, Clock, Users, Heart } from "lucide-react";

const features = [
  { icon: Home, title: "Comfortable Accommodation", desc: "Modern dormitories with supervised living spaces for boys and girls." },
  { icon: Shield, title: "Safety & Security", desc: "24-hour security with trained house parents and matrons on duty." },
  { icon: Utensils, title: "Nutritious Meals", desc: "Three balanced meals daily prepared by our dedicated kitchen staff." },
  { icon: Clock, title: "Structured Study Time", desc: "Supervised evening prep sessions to support academic excellence." },
  { icon: Users, title: "Community Living", desc: "Building lifelong friendships and developing social skills." },
  { icon: Heart, title: "Pastoral Care", desc: "Emotional and spiritual support from dedicated house staff." },
];

export default function Boarding() {
  return (
    <Layout>
      <section className="bg-gradient-to-b from-primary/5 to-background py-16">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 text-center">
            <h1 className="font-heading text-4xl font-bold text-primary md:text-5xl">Boarding</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              A home away from home — our boarding facilities provide a safe, nurturing environment where learners thrive academically and socially.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="h-full border-primary/10 transition-shadow hover:shadow-lg">
                  <CardContent className="flex flex-col items-center p-6 text-center">
                    <div className="mb-4 rounded-full bg-primary/10 p-3">
                      <f.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-foreground">{f.title}</h3>
                    <p className="text-sm text-muted-foreground">{f.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}

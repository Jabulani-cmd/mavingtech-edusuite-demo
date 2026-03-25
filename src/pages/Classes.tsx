import { useDemoData } from "@/contexts/DemoDataContext";
import { motion } from "framer-motion";
import { BookOpen, Users, Clock, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Classes = () => {
  const { classes } = useDemoData();

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Classes & Subjects</h1>
        <p className="page-subtitle">View class schedules, teacher assignments, and room allocations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="hover:shadow-md transition-shadow h-full">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-accent" />
                  </div>
                  <Badge variant="outline">Grade {c.grade}</Badge>
                </div>
                <h3 className="font-semibold text-foreground mb-1">{c.name}</h3>
                <p className="text-sm text-primary font-medium mb-3">{c.teacherName}</p>
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2"><Clock className="h-3.5 w-3.5" />{c.schedule}</div>
                  <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" />{c.room}</div>
                  <div className="flex items-center gap-2"><Users className="h-3.5 w-3.5" />{c.students} students</div>
                </div>
                <div className="mt-3"><span className="demo-badge">Demo</span></div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Classes;

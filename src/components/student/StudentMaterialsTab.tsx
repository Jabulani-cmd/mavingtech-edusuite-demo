import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, FileText, Video, Link as LinkIcon, Presentation, Download, Search, Eye, Printer, type LucideIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useStudentSubjects } from "@/hooks/useStudentSubjects";
import type { QueryData } from "@supabase/supabase-js";

const materialsQuery = () =>
  supabase
    .from("study_materials")
    .select("*, subjects(name), classes(name)")
    .eq("is_published", true)
    .order("created_at", { ascending: false });
type Material = QueryData<ReturnType<typeof materialsQuery>>[number];
import { format } from "date-fns";

const typeIcons: Record<string, LucideIcon> = {
  document: FileText,
  video: Video,
  link: LinkIcon,
  presentation: Presentation,
};

interface Props {
  studentClassId: string | null;
  studentId?: string | null;
}

export default function StudentMaterialsTab({ studentClassId, studentId }: Props) {
  const subjectSelection = useStudentSubjects(studentId);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [subjects, setSubjects] = useState<Pick<Tables<"subjects">, "id" | "name">[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    let query = materialsQuery();

    if (studentClassId) {
      query = query.eq("class_id", studentClassId);
    }

    const { data } = await query;
    setMaterials(data || []);
    setLoading(false);
  }, [studentClassId]);

  useEffect(() => {
    fetchMaterials();
    fetchSubjects();
  }, [fetchMaterials, studentClassId]);

  const fetchSubjects = async () => {
    const { data } = await supabase.from("subjects").select("id, name").order("name");
    setSubjects(data || []);
  };

  const filtered = materials.filter((m) => {
    if (!subjectSelection.includes(m.subjects?.name)) return false;
    const matchSearch = !search || m.title.toLowerCase().includes(search.toLowerCase());
    const matchSubject = subjectFilter === "all" || m.subject_id === subjectFilter;
    return matchSearch && matchSubject;
  });

  const bumpCount = (m: Material) => {
    supabase.from("study_materials").update({ download_count: (m.download_count || 0) + 1 }).eq("id", m.id).then();
  };

  const openView = (m: Material) => {
    const url = m.file_url || m.link_url;
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
    bumpCount(m);
  };

  const openPrint = (m: Material) => {
    const url = m.file_url || m.link_url;
    if (!url) return;
    const w = window.open(url, "_blank");
    if (w) {
      // Give the browser a moment to load the file, then trigger print
      setTimeout(() => {
        try {
          w.focus();
          w.print();
        } catch {
          // Cross-origin files cannot be printed programmatically; the tab stays open for manual printing.
        }
      }, 1200);
    }
    bumpCount(m);
  };

  const safeName = (t: string) => t.replace(/[\\/:*?"<>|]+/g, "").trim() || "study-material";

  const saveBlob = (blob: Blob, name: string) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    const href = a.href;
    setTimeout(() => URL.revokeObjectURL(href), 30_000);
  };

  const buildMaterialPdf = async (m: Material) => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const W = doc.internal.pageSize.getWidth();
    try {
      const logo = (await import("@/assets/mavingtech-logo.png")).default;
      const img = new Image();
      img.src = logo;
      await img.decode();
      const h = 18, w = (img.naturalWidth / img.naturalHeight) * h;
      doc.addImage(img, "PNG", 15, 12, w, h);
    } catch { /* logo optional */ }
    doc.setFont("helvetica", "bold").setFontSize(10).text("MavingTech Business Solutions", W - 15, 18, { align: "right" });
    doc.setFont("helvetica", "normal").setFontSize(9).text("Study Material", W - 15, 23, { align: "right" });
    doc.setDrawColor(20, 120, 130).line(15, 34, W - 15, 34);
    let y = 46;
    doc.setFont("helvetica", "bold").setFontSize(16);
    const title = doc.splitTextToSize(m.title, W - 30);
    doc.text(title, 15, y); y += title.length * 7 + 4;
    doc.setFont("helvetica", "normal").setFontSize(10);
    const rows: [string, string][] = [
      ["Subject", m.subjects?.name || "General"],
      ["Class", m.classes?.name || "-"],
      ["Type", m.material_type],
      ["Published", format(new Date(m.created_at), "d MMMM yyyy")],
    ];
    if (m.tags?.length) rows.push(["Tags", m.tags.join(", ")]);
    rows.forEach(([k, v]) => { doc.setFont("helvetica", "bold").text(`${k}:`, 15, y); doc.setFont("helvetica", "normal").text(String(v), 45, y); y += 6; });
    y += 4;
    if (m.description) {
      doc.setFont("helvetica", "bold").setFontSize(12).text("Notes", 15, y); y += 7;
      doc.setFont("helvetica", "normal").setFontSize(10);
      for (const line of doc.splitTextToSize(m.description, W - 30)) {
        if (y > 280) { doc.addPage(); y = 20; }
        doc.text(line, 15, y); y += 5.5;
      }
      y += 4;
    }
    const url = m.file_url || m.link_url;
    if (url) {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFont("helvetica", "bold").text("Online resource:", 15, y); y += 6;
      doc.setFont("helvetica", "normal").setTextColor(20, 100, 160);
      for (const line of doc.splitTextToSize(url, W - 30)) { doc.textWithLink(line, 15, y, { url }); y += 5; }
      doc.setTextColor(0, 0, 0);
    }
    return doc.output("blob");
  };

  const handleDownload = async (m: Material) => {
    const url = m.file_url;
    const name = safeName(m.title);
    try {
      if (url) {
        const res = await fetch(url);
        if (!res.ok) throw new Error("fetch failed");
        const blob = await res.blob();
        if (blob.type === "application/pdf" || /\.pdf(\?|$)/i.test(url)) {
          saveBlob(new Blob([blob], { type: "application/pdf" }), `${name}.pdf`);
          bumpCount(m);
          return;
        }
      }
      saveBlob(await buildMaterialPdf(m), `${name}.pdf`);
    } catch {
      saveBlob(await buildMaterialPdf(m), `${name}.pdf`);
    }
    bumpCount(m);
  };

  if (loading || subjectSelection.loading) {
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
      {/* Search & Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search materials..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects.filter((s) => subjectSelection.includes(s.name)).map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Materials List */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No study materials available yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Check back later for new uploads from your teachers.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((m) => {
            const Icon = typeIcons[m.material_type] || FileText;
            return (
              <Card key={m.id} className="overflow-hidden">
                <CardContent className="flex items-center gap-3 p-3">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-secondary/10">
                    <Icon className="h-5 w-5 text-secondary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-tight truncate">{m.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-muted-foreground">{m.subjects?.name || "General"}</span>
                      <span className="text-[11px] text-muted-foreground">•</span>
                      <span className="text-[11px] text-muted-foreground">
                        {format(new Date(m.created_at), "MMM d")}
                      </span>
                    </div>
                    {m.tags && m.tags.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {m.tags.slice(0, 2).map((t: string) => (
                          <Badge key={t} variant="outline" className="text-[9px] px-1.5 py-0">{t}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button variant="ghost" size="icon" className="h-9 w-9" title="View" onClick={() => openView(m)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    {m.material_type !== "link" && m.file_url && (
                      <Button variant="ghost" size="icon" className="h-9 w-9" title="Print" onClick={() => openPrint(m)}>
                        <Printer className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-9 w-9" title="Download PDF" aria-label="Download PDF" onClick={() => handleDownload(m)}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

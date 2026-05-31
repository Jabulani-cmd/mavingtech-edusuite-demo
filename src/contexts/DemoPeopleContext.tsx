// @ts-nocheck
import { createContext, useContext, useState, ReactNode } from "react";
import type { DemoStudent, DemoParent } from "@/lib/demoSeeder";

interface Ctx {
  students: DemoStudent[];
  parents: DemoParent[];
  loadedAt: string | null;
  setSeed: (s: { students: DemoStudent[]; parents: DemoParent[] }) => void;
  clear: () => void;
}

const C = createContext<Ctx | null>(null);

export function DemoPeopleProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<DemoStudent[]>([]);
  const [parents, setParents] = useState<DemoParent[]>([]);
  const [loadedAt, setLoadedAt] = useState<string | null>(null);

  return (
    <C.Provider value={{
      students, parents, loadedAt,
      setSeed: (s) => { setStudents(s.students); setParents(s.parents); setLoadedAt(new Date().toISOString()); },
      clear: () => { setStudents([]); setParents([]); setLoadedAt(null); },
    }}>{children}</C.Provider>
  );
}

export function useDemoPeople() {
  const ctx = useContext(C);
  if (!ctx) throw new Error("useDemoPeople must be used inside DemoPeopleProvider");
  return ctx;
}

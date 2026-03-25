import React, { createContext, useContext, useState, useCallback } from "react";
import {
  Student, Teacher, SchoolClass, AttendanceRecord, GradeRecord, Event,
  getInitialData,
} from "@/data/demoData";

interface DemoDataContextType {
  students: Student[];
  teachers: Teacher[];
  classes: SchoolClass[];
  attendance: AttendanceRecord[];
  grades: GradeRecord[];
  events: Event[];
  resetData: () => void;
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  setTeachers: React.Dispatch<React.SetStateAction<Teacher[]>>;
  setClasses: React.Dispatch<React.SetStateAction<SchoolClass[]>>;
  setAttendance: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
  setGrades: React.Dispatch<React.SetStateAction<GradeRecord[]>>;
}

const DemoDataContext = createContext<DemoDataContextType | null>(null);

export const useDemoData = () => {
  const ctx = useContext(DemoDataContext);
  if (!ctx) throw new Error("useDemoData must be inside DemoDataProvider");
  return ctx;
};

export const DemoDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const init = getInitialData();
  const [students, setStudents] = useState<Student[]>(init.students);
  const [teachers, setTeachers] = useState<Teacher[]>(init.teachers);
  const [classes, setClasses] = useState<SchoolClass[]>(init.classes);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(init.attendance);
  const [grades, setGrades] = useState<GradeRecord[]>(init.grades);
  const [events] = useState<Event[]>(init.events);

  const resetData = useCallback(() => {
    const fresh = getInitialData();
    setStudents(fresh.students);
    setTeachers(fresh.teachers);
    setClasses(fresh.classes);
    setAttendance(fresh.attendance);
    setGrades(fresh.grades);
  }, []);

  return (
    <DemoDataContext.Provider value={{ students, teachers, classes, attendance, grades, events, resetData, setStudents, setTeachers, setClasses, setAttendance, setGrades }}>
      {children}
    </DemoDataContext.Provider>
  );
};

import { createContext, useContext, useState, useMemo, ReactNode } from "react";

export type EmploymentType = "Full-time" | "Part-time" | "Contract";
export type PreferredTime = "Morning" | "Afternoon" | "Both";
export type RoomType = "Regular" | "Lab" | "Computer Room" | "Library" | "Sports Field" | "Hall";

export interface Teacher {
  id: string;
  name: string;
  email: string;
  employeeNumber: string;
  employmentType: EmploymentType;
  maxPeriodsPerWeek: number;
  preferredTime: PreferredTime;
  qualifiedSubjects: string[]; // subject ids
  qualifiedGrades: number[];
  photoUrl?: string;
}

export interface Subject {
  id: string;
  name: string;
  color: string; // hsl token
}

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  capacity: number;
}

export interface SchoolClass {
  id: string;
  name: string;
  gradeLevel: number;
  stream?: string;
  studentCount: number;
  classTeacherId?: string;
  subjects: { subjectId: string; periodsPerWeek: number; roomType: RoomType }[];
}

export interface Allocation {
  id: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  periodsPerWeek: number;
}

export interface TimetableSlot {
  id: string;
  classId: string;
  day: number; // 0..4 Mon-Fri
  period: number; // 1..8
  startTime: string;
  endTime: string;
  subjectId?: string;
  teacherId?: string;
  roomId?: string;
}

const PERIODS = [
  { period: 1, start: "07:30", end: "08:10" },
  { period: 2, start: "08:15", end: "08:55" },
  { period: 3, start: "09:00", end: "09:40" },
  { period: 4, start: "10:00", end: "10:40" },
  { period: 5, start: "10:45", end: "11:25" },
  { period: 6, start: "11:30", end: "12:10" },
  { period: 7, start: "13:00", end: "13:40" },
  { period: 8, start: "13:45", end: "14:25" },
];

const SUBJECT_PALETTE = [
  "hsl(189 94% 43%)",
  "hsl(217 91% 60%)",
  "hsl(262 83% 58%)",
  "hsl(330 81% 60%)",
  "hsl(24 95% 53%)",
  "hsl(142 71% 45%)",
  "hsl(45 93% 47%)",
  "hsl(0 84% 60%)",
  "hsl(173 80% 40%)",
  "hsl(280 65% 60%)",
];

const seedSubjects: Subject[] = [
  "Mathematics", "English", "Combined Science", "History", "Geography",
  "ICT", "Shona", "Physical Education", "Business Studies", "Art",
].map((name, i) => ({ id: `sub-${i + 1}`, name, color: SUBJECT_PALETTE[i] }));

const seedRooms: Room[] = [
  { id: "rm-1", name: "Room 5", type: "Regular", capacity: 40 },
  { id: "rm-2", name: "Room 6", type: "Regular", capacity: 40 },
  { id: "rm-3", name: "Room 7", type: "Regular", capacity: 40 },
  { id: "rm-4", name: "Room 8", type: "Regular", capacity: 40 },
  { id: "rm-5", name: "Science Lab 1", type: "Lab", capacity: 32 },
  { id: "rm-6", name: "Computer Room A", type: "Computer Room", capacity: 30 },
  { id: "rm-7", name: "School Hall", type: "Hall", capacity: 200 },
  { id: "rm-8", name: "Sports Field", type: "Sports Field", capacity: 100 },
];

const seedTeachers: Teacher[] = [
  { id: "t-1", name: "Mr. T. Ncube", email: "ncube@mavingtech.com", employeeNumber: "MHS-S00001", employmentType: "Full-time", maxPeriodsPerWeek: 28, preferredTime: "Both", qualifiedSubjects: ["sub-1", "sub-9"], qualifiedGrades: [8, 9, 10] },
  { id: "t-2", name: "Mrs. R. Moyo", email: "moyo@mavingtech.com", employeeNumber: "MHS-S00002", employmentType: "Full-time", maxPeriodsPerWeek: 28, preferredTime: "Morning", qualifiedSubjects: ["sub-2", "sub-7"], qualifiedGrades: [8, 9, 10, 11] },
  { id: "t-3", name: "Mr. S. Dube", email: "dube@mavingtech.com", employeeNumber: "MHS-S00003", employmentType: "Full-time", maxPeriodsPerWeek: 28, preferredTime: "Both", qualifiedSubjects: ["sub-3", "sub-5"], qualifiedGrades: [8, 9, 10] },
  { id: "t-4", name: "Ms. P. Chirwa", email: "chirwa@mavingtech.com", employeeNumber: "MHS-S00004", employmentType: "Part-time", maxPeriodsPerWeek: 16, preferredTime: "Afternoon", qualifiedSubjects: ["sub-6", "sub-10"], qualifiedGrades: [9, 10] },
  { id: "t-5", name: "Mr. K. Banda", email: "banda@mavingtech.com", employeeNumber: "MHS-S00005", employmentType: "Full-time", maxPeriodsPerWeek: 28, preferredTime: "Both", qualifiedSubjects: ["sub-4", "sub-7"], qualifiedGrades: [8, 9, 10, 11] },
  { id: "t-6", name: "Mrs. L. Mguni", email: "mguni@mavingtech.com", employeeNumber: "MHS-S00006", employmentType: "Full-time", maxPeriodsPerWeek: 28, preferredTime: "Morning", qualifiedSubjects: ["sub-8"], qualifiedGrades: [8, 9, 10, 11] },
];

const seedClasses: SchoolClass[] = [
  {
    id: "c-1", name: "Grade 8A", gradeLevel: 8, stream: "Sciences", studentCount: 32, classTeacherId: "t-1",
    subjects: [
      { subjectId: "sub-1", periodsPerWeek: 5, roomType: "Regular" },
      { subjectId: "sub-2", periodsPerWeek: 5, roomType: "Regular" },
      { subjectId: "sub-3", periodsPerWeek: 4, roomType: "Lab" },
      { subjectId: "sub-4", periodsPerWeek: 3, roomType: "Regular" },
      { subjectId: "sub-6", periodsPerWeek: 3, roomType: "Computer Room" },
      { subjectId: "sub-8", periodsPerWeek: 2, roomType: "Sports Field" },
    ],
  },
  {
    id: "c-2", name: "Grade 9B", gradeLevel: 9, stream: "Commerce", studentCount: 30, classTeacherId: "t-2",
    subjects: [
      { subjectId: "sub-1", periodsPerWeek: 5, roomType: "Regular" },
      { subjectId: "sub-2", periodsPerWeek: 5, roomType: "Regular" },
      { subjectId: "sub-5", periodsPerWeek: 3, roomType: "Regular" },
      { subjectId: "sub-9", periodsPerWeek: 4, roomType: "Regular" },
      { subjectId: "sub-7", periodsPerWeek: 3, roomType: "Regular" },
    ],
  },
  {
    id: "c-3", name: "Grade 10C", gradeLevel: 10, stream: "Arts", studentCount: 28, classTeacherId: "t-5",
    subjects: [
      { subjectId: "sub-1", periodsPerWeek: 4, roomType: "Regular" },
      { subjectId: "sub-2", periodsPerWeek: 5, roomType: "Regular" },
      { subjectId: "sub-4", periodsPerWeek: 4, roomType: "Regular" },
      { subjectId: "sub-10", periodsPerWeek: 3, roomType: "Regular" },
      { subjectId: "sub-8", periodsPerWeek: 2, roomType: "Hall" },
    ],
  },
];

function seedAllocations(): Allocation[] {
  const out: Allocation[] = [];
  for (const c of seedClasses) {
    for (const s of c.subjects) {
      const teacher = seedTeachers.find(
        (t) => t.qualifiedSubjects.includes(s.subjectId) && t.qualifiedGrades.includes(c.gradeLevel)
      );
      if (teacher) {
        out.push({
          id: `a-${c.id}-${s.subjectId}`,
          classId: c.id,
          subjectId: s.subjectId,
          teacherId: teacher.id,
          periodsPerWeek: s.periodsPerWeek,
        });
      }
    }
  }
  return out;
}

function seedTimetable(allocs: Allocation[]): TimetableSlot[] {
  const slots: TimetableSlot[] = [];
  const teacherBusy = new Set<string>(); // day-period-teacher
  const roomBusy = new Set<string>(); // day-period-room

  for (const c of seedClasses) {
    const classAllocs = allocs.filter((a) => a.classId === c.id);
    // create empty slot map for class
    for (let day = 0; day < 5; day++) {
      for (const p of PERIODS) {
        slots.push({
          id: `s-${c.id}-${day}-${p.period}`,
          classId: c.id,
          day,
          period: p.period,
          startTime: p.start,
          endTime: p.end,
        });
      }
    }
    // fill
    let cursor = 0;
    for (const a of classAllocs) {
      const classSubj = c.subjects.find((s) => s.subjectId === a.subjectId);
      const roomCandidates = seedRooms.filter((r) => r.type === (classSubj?.roomType ?? "Regular"));
      let placed = 0;
      const total = 5 * PERIODS.length;
      while (placed < a.periodsPerWeek && cursor < total * 2) {
        const idx = cursor % total;
        const day = Math.floor(idx / PERIODS.length);
        const period = (idx % PERIODS.length) + 1;
        const tKey = `${day}-${period}-${a.teacherId}`;
        const slot = slots.find((s) => s.classId === c.id && s.day === day && s.period === period && !s.subjectId);
        const room = roomCandidates.find((r) => !roomBusy.has(`${day}-${period}-${r.id}`));
        if (slot && !teacherBusy.has(tKey) && room) {
          slot.subjectId = a.subjectId;
          slot.teacherId = a.teacherId;
          slot.roomId = room.id;
          teacherBusy.add(tKey);
          roomBusy.add(`${day}-${period}-${room.id}`);
          placed++;
        }
        cursor++;
      }
    }
  }
  return slots;
}

const initialAllocations = seedAllocations();
const initialSlots = seedTimetable(initialAllocations);

interface Ctx {
  teachers: Teacher[];
  subjects: Subject[];
  rooms: Room[];
  classes: SchoolClass[];
  allocations: Allocation[];
  slots: TimetableSlot[];
  periodSchedule: typeof PERIODS;
  setAllocation: (classId: string, subjectId: string, teacherId: string) => void;
  removeAllocation: (allocationId: string) => void;
  updateSlot: (slotId: string, patch: Partial<TimetableSlot>) => void;
  rebuildTimetable: () => void;
  updateTeacher: (id: string, patch: Partial<Teacher>) => void;
}

const AllocationCtx = createContext<Ctx | null>(null);

export function AllocationProvider({ children }: { children: ReactNode }) {
  const [teachers, setTeachers] = useState<Teacher[]>(seedTeachers);
  const [classes] = useState<SchoolClass[]>(seedClasses);
  const [allocations, setAllocations] = useState<Allocation[]>(initialAllocations);
  const [slots, setSlots] = useState<TimetableSlot[]>(initialSlots);

  const value = useMemo<Ctx>(() => ({
    teachers,
    subjects: seedSubjects,
    rooms: seedRooms,
    classes,
    allocations,
    slots,
    periodSchedule: PERIODS,
    setAllocation: (classId, subjectId, teacherId) => {
      setAllocations((prev) => {
        const existing = prev.find((a) => a.classId === classId && a.subjectId === subjectId);
        const cs = classes.find((c) => c.id === classId)?.subjects.find((s) => s.subjectId === subjectId);
        const periods = cs?.periodsPerWeek ?? 3;
        if (existing) {
          return prev.map((a) => (a.id === existing.id ? { ...a, teacherId } : a));
        }
        return [...prev, { id: `a-${Date.now()}`, classId, subjectId, teacherId, periodsPerWeek: periods }];
      });
    },
    removeAllocation: (id) => setAllocations((prev) => prev.filter((a) => a.id !== id)),
    updateSlot: (id, patch) => setSlots((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s))),
    rebuildTimetable: () => setSlots(seedTimetable(allocations)),
    updateTeacher: (id, patch) => setTeachers((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t))),
  }), [teachers, classes, allocations, slots]);

  return <AllocationCtx.Provider value={value}>{children}</AllocationCtx.Provider>;
}

export function useAllocation() {
  const ctx = useContext(AllocationCtx);
  if (!ctx) throw new Error("useAllocation must be used inside AllocationProvider");
  return ctx;
}

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

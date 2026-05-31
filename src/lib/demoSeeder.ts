// @ts-nocheck
// Demo data seeder — generates a complete realistic Zimbabwean school dataset.
import type {
  Teacher, Subject, Room, SchoolClass, Allocation, TimetableSlot, RoomType,
} from "@/contexts/AllocationContext";

export interface DemoStudent {
  id: string;
  fullName: string;
  dob: string;
  gender: "Male" | "Female";
  admissionNumber: string;
  form: number;
  stream: "A" | "B";
  classId: string;
  email: string;
  password: string;
}

export interface DemoParent {
  id: string;
  studentId: string;
  fullName: string;
  relationship: "Mother" | "Father" | "Guardian";
  phone: string;
  email: string;
  password: string;
}

export interface DemoSeed {
  teachers: Teacher[];
  subjects: Subject[];
  rooms: Room[];
  classes: SchoolClass[];
  allocations: Allocation[];
  slots: TimetableSlot[];
  students: DemoStudent[];
  parents: DemoParent[];
}

// --- Period schedule per the spec (07:30–15:30, 8x45min, break after P3, lunch after P5) ---
export const DEMO_PERIODS = [
  { period: 1, start: "07:30", end: "08:15" },
  { period: 2, start: "08:15", end: "09:00" },
  { period: 3, start: "09:00", end: "09:45" },
  // 15-min break
  { period: 4, start: "10:00", end: "10:45" },
  { period: 5, start: "10:45", end: "11:30" },
  // 30-min lunch
  { period: 6, start: "12:00", end: "12:45" },
  { period: 7, start: "12:45", end: "13:30" },
  { period: 8, start: "13:30", end: "14:15" },
];

const PALETTE = [
  "hsl(189 94% 43%)","hsl(217 91% 60%)","hsl(262 83% 58%)","hsl(330 81% 60%)",
  "hsl(24 95% 53%)","hsl(142 71% 45%)","hsl(45 93% 47%)","hsl(0 84% 60%)",
  "hsl(173 80% 40%)","hsl(280 65% 60%)","hsl(200 90% 50%)","hsl(15 90% 55%)",
  "hsl(100 60% 45%)","hsl(340 70% 55%)","hsl(50 80% 50%)",
];

const SUBJECT_DEFS: Array<{ name: string; allowed: RoomType[]; forms: number[]; periodsPerWeek: number }> = [
  { name: "Mathematics",       allowed: ["Regular"],       forms: [1,2,3,4,5,6], periodsPerWeek: 6 },
  { name: "English Language",  allowed: ["Regular"],       forms: [1,2,3,4,5,6], periodsPerWeek: 6 },
  { name: "Shona",             allowed: ["Regular"],       forms: [1,2,3,4],     periodsPerWeek: 4 },
  { name: "History",           allowed: ["Regular"],       forms: [1,2,3,4,5,6], periodsPerWeek: 3 },
  { name: "Geography",         allowed: ["Regular"],       forms: [1,2,3,4,5,6], periodsPerWeek: 3 },
  { name: "Combined Science",  allowed: ["Lab"],           forms: [1,2],         periodsPerWeek: 5 },
  { name: "Physics",           allowed: ["Lab"],           forms: [3,4,5,6],     periodsPerWeek: 4 },
  { name: "Chemistry",         allowed: ["Lab"],           forms: [3,4,5,6],     periodsPerWeek: 4 },
  { name: "Biology",           allowed: ["Lab"],           forms: [3,4,5,6],     periodsPerWeek: 4 },
  { name: "Computer Science",  allowed: ["Computer Room"], forms: [1,2,3,4,5,6], periodsPerWeek: 3 },
  { name: "Physical Education",allowed: ["Hall","Sports Field"], forms: [1,2,3,4], periodsPerWeek: 2 },
  { name: "Art and Design",    allowed: ["Regular"],       forms: [1,2,3,4],     periodsPerWeek: 2 },
  { name: "Agriculture",       allowed: ["Regular"],       forms: [1,2,3,4,5,6], periodsPerWeek: 3 },
  { name: "Business Studies",  allowed: ["Regular"],       forms: [3,4,5,6],     periodsPerWeek: 3 },
  { name: "Accounts",          allowed: ["Regular"],       forms: [3,4,5,6],     periodsPerWeek: 3 },
];

const ROOM_DEFS: Array<{ name: string; type: RoomType; capacity: number }> = [
  ...Array.from({ length: 12 }, (_, i) => ({ name: `Room ${i + 1}`, type: "Regular" as RoomType, capacity: 40 })),
  { name: "Science Lab A",    type: "Lab",           capacity: 32 },
  { name: "Science Lab B",    type: "Lab",           capacity: 32 },
  { name: "Computer Lab",     type: "Computer Room", capacity: 30 },
  { name: "Art Room",         type: "Regular",       capacity: 28 },
  { name: "Agriculture Room", type: "Regular",       capacity: 30 },
  { name: "School Hall",      type: "Hall",          capacity: 250 },
  { name: "Sports Field",     type: "Sports Field",  capacity: 200 },
  { name: "Library",          type: "Library",       capacity: 60 },
];

const ZW_FIRST_M = ["Tendai","Tatenda","Tafadzwa","Tinashe","Takudzwa","Munashe","Farai","Kudzai","Nyasha","Tawanda","Simba","Panashe","Tanaka","Anesu","Rutendo","Tapiwa","Brian","Blessing","Knowledge","Trust","Norman","Wisdom","Tonderai","Tichaona","Tonderai"];
const ZW_FIRST_F = ["Chipo","Rumbidzai","Tariro","Vimbai","Ruvarashe","Anesu","Rutendo","Tendai","Mukundwa","Nyasha","Tariro","Yeukai","Ropafadzo","Kundai","Rufaro","Tatenda","Shamiso","Tanaka","Tinotenda","Munyaradzi","Memory","Charity","Faith","Patience","Precious"];
const ZW_SURNAMES = ["Moyo","Ncube","Dube","Sibanda","Mhlanga","Mguni","Banda","Chirwa","Mpofu","Nyathi","Ndlovu","Mthembu","Chitsa","Mutasa","Chikomba","Chigumira","Chinamasa","Marufu","Madziva","Gumbo","Hove","Mafa","Zvavamwe","Zhou","Mberi","Nyoni","Tshuma","Khumalo","Mlilo","Sithole","Mavhunga","Chidziva","Marufu"];

function pick<T>(arr: T[], i: number): T { return arr[i % arr.length]; }
function rand(seed: number) { return ((seed * 9301 + 49297) % 233280) / 233280; }

export function generateDemoSeed(): DemoSeed {
  // ---- Rooms ----
  const rooms: Room[] = ROOM_DEFS.map((r, i) => ({ id: `rm-${i + 1}`, ...r }));

  // ---- Subjects ----
  const subjects: Subject[] = SUBJECT_DEFS.map((s, i) => ({
    id: `sub-${i + 1}`,
    name: s.name,
    color: PALETTE[i % PALETTE.length],
    allowedRoomTypes: s.allowed,
  }));

  // ---- Teachers (20) ----
  // Emails follow demo credential doc: <first>.<surname>@schooldemo.com / Teacher@2025
  const teachers: Teacher[] = [];
  for (let i = 0; i < 20; i++) {
    const isFemale = i % 2 === 0;
    const first = isFemale ? pick(ZW_FIRST_F, i + 3) : pick(ZW_FIRST_M, i + 1);
    const surname = pick(ZW_SURNAMES, i * 3 + 1);
    const title = isFemale ? (i % 4 === 0 ? "Ms." : "Mrs.") : "Mr.";
    teachers.push({
      id: `t-${i + 1}`,
      name: `${title} ${first} ${surname}`,
      email: `${first.toLowerCase()}.${surname.toLowerCase()}@schooldemo.com`,
      employeeNumber: `T${String(i + 1).padStart(3, "0")}`,
      employmentType: i % 7 === 0 ? "Part-time" : "Full-time",
      maxPeriodsPerWeek: i % 7 === 0 ? 18 : 30,
      preferredTime: "Both",
      qualifiedSubjects: [],
      qualifiedGrades: [1, 2, 3, 4, 5, 6],
    });
  }
  // Assign each subject to 1-2 teachers, round-robin so every subject is covered.
  subjects.forEach((sub, si) => {
    const t1 = teachers[si % teachers.length];
    const t2 = teachers[(si + 7) % teachers.length];
    if (!t1.qualifiedSubjects.includes(sub.id)) t1.qualifiedSubjects.push(sub.id);
    if (!t2.qualifiedSubjects.includes(sub.id)) t2.qualifiedSubjects.push(sub.id);
  });
  // Make sure every teacher has at least one subject.
  teachers.forEach((t, i) => {
    if (t.qualifiedSubjects.length === 0) {
      t.qualifiedSubjects.push(subjects[i % subjects.length].id);
    }
  });

  // ---- Classes (Form 1A..6B = 12) ----
  const classes: SchoolClass[] = [];
  for (let form = 1; form <= 6; form++) {
    for (const stream of ["A", "B"] as const) {
      const id = `c-${form}${stream}`;
      const classTeacher = teachers[(form * 2 + (stream === "A" ? 0 : 1)) % teachers.length];
      const applicableSubjects = SUBJECT_DEFS
        .map((s, idx) => ({ s, id: `sub-${idx + 1}` }))
        .filter(({ s }) => s.forms.includes(form))
        .map(({ s, id: sid }) => ({
          subjectId: sid,
          periodsPerWeek: s.periodsPerWeek,
          roomType: s.allowed[0],
        }));
      classes.push({
        id,
        name: `Form ${form}${stream}`,
        gradeLevel: form + 7, // Form 1 = grade 8 conceptually
        stream,
        studentCount: 15,
        classTeacherId: classTeacher.id,
        subjects: applicableSubjects,
      });
    }
  }

  // ---- Students (180) ----
  const students: DemoStudent[] = [];
  let sIdx = 0;
  for (const c of classes) {
    for (let n = 0; n < 15; n++) {
      const female = sIdx % 2 === 0;
      const first = female ? pick(ZW_FIRST_F, sIdx + 5) : pick(ZW_FIRST_M, sIdx + 9);
      const surname = pick(ZW_SURNAMES, sIdx * 7 + 11);
      const form = parseInt(c.name.replace(/\D/g, ""), 10);
      const age = 12 + form; // Form 1 ≈ 13 yrs
      const birthYear = new Date().getFullYear() - age;
      const month = ((sIdx * 3) % 12) + 1;
      const day = ((sIdx * 7) % 27) + 1;
      const admissionNumber = `MHS${String(2026000 + sIdx + 1)}`;
      const email = `${admissionNumber.toLowerCase()}@students.mavingtech.ac.zw`;
      students.push({
        id: `st-${sIdx + 1}`,
        fullName: `${first} ${surname}`,
        dob: `${birthYear}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`,
        gender: female ? "Female" : "Male",
        admissionNumber,
        form,
        stream: c.stream as "A" | "B",
        classId: c.id,
        email,
        password: "demo123",
      });
      sIdx++;
    }
  }

  // ---- Parents (2 per student = 360) ----
  const parents: DemoParent[] = [];
  students.forEach((stu, i) => {
    const surname = stu.fullName.split(" ").slice(-1)[0];
    const father = pick(ZW_FIRST_M, i + 4);
    const mother = pick(ZW_FIRST_F, i + 6);
    parents.push({
      id: `p-${i * 2 + 1}`,
      studentId: stu.id,
      fullName: `${father} ${surname}`,
      relationship: "Father",
      phone: `+263 77${String(1000000 + i).slice(0, 7)}`,
      email: `${father.toLowerCase()}.${surname.toLowerCase()}${i}@parents.mavingtech.ac.zw`,
      password: "demo123",
    });
    parents.push({
      id: `p-${i * 2 + 2}`,
      studentId: stu.id,
      fullName: `${mother} ${surname}`,
      relationship: "Mother",
      phone: `+263 78${String(2000000 + i).slice(0, 7)}`,
      email: `${mother.toLowerCase()}.${surname.toLowerCase()}${i}@parents.mavingtech.ac.zw`,
      password: "demo123",
    });
  });

  // ---- Allocations (class × subject → teacher) ----
  const allocations: Allocation[] = [];
  for (const c of classes) {
    for (const cs of c.subjects) {
      const qualified = teachers.filter(t => t.qualifiedSubjects.includes(cs.subjectId));
      const teacher = qualified[(parseInt(c.id.replace(/\D/g, "1"), 10) + cs.subjectId.length) % qualified.length] ?? qualified[0];
      allocations.push({
        id: `a-${c.id}-${cs.subjectId}`,
        classId: c.id,
        subjectId: cs.subjectId,
        teacherId: teacher.id,
        periodsPerWeek: cs.periodsPerWeek,
      });
    }
  }

  // ---- Timetable slots (5 days × 8 periods × 12 classes = 480) ----
  // Constraint solver: avoid teacher/room double-booking, honour room type, fill every slot.
  const slots: TimetableSlot[] = [];
  for (const c of classes) {
    for (let day = 0; day < 5; day++) {
      for (const p of DEMO_PERIODS) {
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
  }

  const teacherBusy = new Set<string>();
  const roomBusy = new Set<string>();

  // Sort placements by tightest constraint first (fewest allowed rooms).
  const placements = allocations.flatMap(a => {
    const sub = subjects.find(s => s.id === a.subjectId)!;
    const constraint = sub.allowedRoomTypes.length;
    return Array(a.periodsPerWeek).fill(null).map(() => ({ alloc: a, constraint, sub }));
  }).sort((x, y) => x.constraint - y.constraint);

  for (const { alloc, sub } of placements) {
    const candidateRooms = rooms.filter(r => sub.allowedRoomTypes.includes(r.type));
    const open = slots
      .filter(s => s.classId === alloc.classId && !s.subjectId)
      .sort((a, b) => a.day - b.day || a.period - b.period);
    for (const slot of open) {
      const tKey = `${slot.day}-${slot.period}-${alloc.teacherId}`;
      if (teacherBusy.has(tKey)) continue;
      const room = candidateRooms.find(r => !roomBusy.has(`${slot.day}-${slot.period}-${r.id}`));
      if (!room) continue;
      slot.subjectId = alloc.subjectId;
      slot.teacherId = alloc.teacherId;
      slot.roomId = room.id;
      teacherBusy.add(tKey);
      roomBusy.add(`${slot.day}-${slot.period}-${room.id}`);
      break;
    }
  }

  // FILL guarantee: any remaining empty slot gets a Study Hall in a free Regular room with the class teacher.
  const studyHall: Subject = {
    id: "sub-study",
    name: "Study Hall",
    color: "hsl(220 15% 60%)",
    allowedRoomTypes: ["Regular", "Library", "Hall"],
  };
  let injectedStudy = false;
  for (const slot of slots) {
    if (slot.subjectId) continue;
    injectedStudy = true;
    const cls = classes.find(c => c.id === slot.classId)!;
    const teacherId = cls.classTeacherId ?? teachers[0].id;
    const tKey = `${slot.day}-${slot.period}-${teacherId}`;
    // Even if class teacher is busy, we still assign — Study Hall is supervised by available teacher.
    const altTeacher = teacherBusy.has(tKey)
      ? (teachers.find(t => !teacherBusy.has(`${slot.day}-${slot.period}-${t.id}`)) ?? teachers[0])
      : (teachers.find(t => t.id === teacherId) ?? teachers[0]);
    const room = rooms.find(r =>
      ["Regular", "Library", "Hall"].includes(r.type) &&
      !roomBusy.has(`${slot.day}-${slot.period}-${r.id}`)
    ) ?? rooms[0];
    slot.subjectId = studyHall.id;
    slot.teacherId = altTeacher.id;
    slot.roomId = room.id;
    teacherBusy.add(`${slot.day}-${slot.period}-${altTeacher.id}`);
    roomBusy.add(`${slot.day}-${slot.period}-${room.id}`);
  }
  if (injectedStudy && !subjects.find(s => s.id === studyHall.id)) {
    subjects.push(studyHall);
  }

  return { teachers, subjects, rooms, classes, allocations, slots, students, parents };
}

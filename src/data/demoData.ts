export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  grade: string;
  class: string;
  email: string;
  guardianName: string;
  guardianPhone: string;
  enrollmentDate: string;
  status: "active" | "inactive";
}

export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  phone: string;
  hireDate: string;
  status: "active" | "on-leave";
}

export interface SchoolClass {
  id: string;
  name: string;
  grade: string;
  subject: string;
  teacherId: string;
  teacherName: string;
  schedule: string;
  students: number;
  room: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  date: string;
  status: "present" | "absent" | "late" | "excused";
}

export interface GradeRecord {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  subject: string;
  assignment: string;
  score: number;
  maxScore: number;
  date: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  type: "exam" | "meeting" | "holiday" | "event";
}

export const demoStudents: Student[] = [
  { id: "S001", firstName: "Amina", lastName: "Moyo", grade: "10", class: "10A", email: "amina.m@demo.edu", guardianName: "Sarah Moyo", guardianPhone: "+263 771 234 567", enrollmentDate: "2024-01-15", status: "active" },
  { id: "S002", firstName: "Tendai", lastName: "Chikwanha", grade: "10", class: "10A", email: "tendai.c@demo.edu", guardianName: "Peter Chikwanha", guardianPhone: "+263 772 345 678", enrollmentDate: "2024-01-15", status: "active" },
  { id: "S003", firstName: "Rudo", lastName: "Mapfumo", grade: "11", class: "11B", email: "rudo.m@demo.edu", guardianName: "Grace Mapfumo", guardianPhone: "+263 773 456 789", enrollmentDate: "2023-01-12", status: "active" },
  { id: "S004", firstName: "Tatenda", lastName: "Ndlovu", grade: "11", class: "11A", email: "tatenda.n@demo.edu", guardianName: "James Ndlovu", guardianPhone: "+263 774 567 890", enrollmentDate: "2023-01-12", status: "active" },
  { id: "S005", firstName: "Farai", lastName: "Sibanda", grade: "9", class: "9A", email: "farai.s@demo.edu", guardianName: "Mary Sibanda", guardianPhone: "+263 775 678 901", enrollmentDate: "2025-01-10", status: "active" },
  { id: "S006", firstName: "Nyasha", lastName: "Mutasa", grade: "9", class: "9B", email: "nyasha.m@demo.edu", guardianName: "John Mutasa", guardianPhone: "+263 776 789 012", enrollmentDate: "2025-01-10", status: "active" },
  { id: "S007", firstName: "Chipo", lastName: "Banda", grade: "12", class: "12A", email: "chipo.b@demo.edu", guardianName: "Ruth Banda", guardianPhone: "+263 777 890 123", enrollmentDate: "2022-01-14", status: "active" },
  { id: "S008", firstName: "Kudzai", lastName: "Zvobgo", grade: "12", class: "12A", email: "kudzai.z@demo.edu", guardianName: "Thomas Zvobgo", guardianPhone: "+263 778 901 234", enrollmentDate: "2022-01-14", status: "active" },
  { id: "S009", firstName: "Blessing", lastName: "Ncube", grade: "10", class: "10B", email: "blessing.n@demo.edu", guardianName: "Agnes Ncube", guardianPhone: "+263 779 012 345", enrollmentDate: "2024-01-15", status: "inactive" },
  { id: "S010", firstName: "Tafara", lastName: "Gumbo", grade: "11", class: "11A", email: "tafara.g@demo.edu", guardianName: "David Gumbo", guardianPhone: "+263 771 123 456", enrollmentDate: "2023-01-12", status: "active" },
];

export const demoTeachers: Teacher[] = [
  { id: "T001", firstName: "Margaret", lastName: "Dube", email: "m.dube@demo.edu", subject: "Mathematics", phone: "+263 712 111 222", hireDate: "2018-03-01", status: "active" },
  { id: "T002", firstName: "Robert", lastName: "Kamanga", email: "r.kamanga@demo.edu", subject: "English Language", phone: "+263 712 222 333", hireDate: "2019-06-15", status: "active" },
  { id: "T003", firstName: "Sithembile", lastName: "Moyo", email: "s.moyo@demo.edu", subject: "Science", phone: "+263 712 333 444", hireDate: "2020-01-10", status: "active" },
  { id: "T004", firstName: "Emmanuel", lastName: "Chirwa", email: "e.chirwa@demo.edu", subject: "History", phone: "+263 712 444 555", hireDate: "2017-09-01", status: "active" },
  { id: "T005", firstName: "Tendai", lastName: "Phiri", email: "t.phiri@demo.edu", subject: "Geography", phone: "+263 712 555 666", hireDate: "2021-02-20", status: "on-leave" },
  { id: "T006", firstName: "Janet", lastName: "Mhlanga", email: "j.mhlanga@demo.edu", subject: "Computer Science", phone: "+263 712 666 777", hireDate: "2022-01-05", status: "active" },
];

export const demoClasses: SchoolClass[] = [
  { id: "C001", name: "10A Mathematics", grade: "10", subject: "Mathematics", teacherId: "T001", teacherName: "Mrs. M. Dube", schedule: "Mon, Wed, Fri 08:00–09:00", students: 32, room: "Room 101" },
  { id: "C002", name: "10A English", grade: "10", subject: "English Language", teacherId: "T002", teacherName: "Mr. R. Kamanga", schedule: "Tue, Thu 08:00–09:30", students: 32, room: "Room 205" },
  { id: "C003", name: "11B Science", grade: "11", subject: "Science", teacherId: "T003", teacherName: "Ms. S. Moyo", schedule: "Mon, Wed 10:00–11:30", students: 28, room: "Lab 1" },
  { id: "C004", name: "11A History", grade: "11", subject: "History", teacherId: "T004", teacherName: "Mr. E. Chirwa", schedule: "Tue, Thu 10:00–11:00", students: 30, room: "Room 302" },
  { id: "C005", name: "9A Geography", grade: "9", subject: "Geography", teacherId: "T005", teacherName: "Mr. T. Phiri", schedule: "Mon, Fri 11:00–12:00", students: 35, room: "Room 104" },
  { id: "C006", name: "12A Computer Science", grade: "12", subject: "Computer Science", teacherId: "T006", teacherName: "Ms. J. Mhlanga", schedule: "Wed, Fri 14:00–15:30", students: 22, room: "Computer Lab" },
];

export const demoAttendance: AttendanceRecord[] = [
  { id: "A001", studentId: "S001", studentName: "Amina Moyo", class: "10A", date: "2025-03-24", status: "present" },
  { id: "A002", studentId: "S002", studentName: "Tendai Chikwanha", class: "10A", date: "2025-03-24", status: "present" },
  { id: "A003", studentId: "S003", studentName: "Rudo Mapfumo", class: "11B", date: "2025-03-24", status: "late" },
  { id: "A004", studentId: "S004", studentName: "Tatenda Ndlovu", class: "11A", date: "2025-03-24", status: "present" },
  { id: "A005", studentId: "S005", studentName: "Farai Sibanda", class: "9A", date: "2025-03-24", status: "absent" },
  { id: "A006", studentId: "S006", studentName: "Nyasha Mutasa", class: "9B", date: "2025-03-24", status: "present" },
  { id: "A007", studentId: "S007", studentName: "Chipo Banda", class: "12A", date: "2025-03-24", status: "present" },
  { id: "A008", studentId: "S008", studentName: "Kudzai Zvobgo", class: "12A", date: "2025-03-24", status: "excused" },
  { id: "A009", studentId: "S009", studentName: "Blessing Ncube", class: "10B", date: "2025-03-24", status: "absent" },
  { id: "A010", studentId: "S010", studentName: "Tafara Gumbo", class: "11A", date: "2025-03-24", status: "present" },
  { id: "A011", studentId: "S001", studentName: "Amina Moyo", class: "10A", date: "2025-03-21", status: "present" },
  { id: "A012", studentId: "S002", studentName: "Tendai Chikwanha", class: "10A", date: "2025-03-21", status: "late" },
  { id: "A013", studentId: "S005", studentName: "Farai Sibanda", class: "9A", date: "2025-03-21", status: "present" },
  { id: "A014", studentId: "S007", studentName: "Chipo Banda", class: "12A", date: "2025-03-21", status: "present" },
];

export const demoGrades: GradeRecord[] = [
  { id: "G001", studentId: "S001", studentName: "Amina Moyo", class: "10A", subject: "Mathematics", assignment: "Term 1 Exam", score: 85, maxScore: 100, date: "2025-03-15" },
  { id: "G002", studentId: "S001", studentName: "Amina Moyo", class: "10A", subject: "English", assignment: "Essay", score: 72, maxScore: 100, date: "2025-03-10" },
  { id: "G003", studentId: "S002", studentName: "Tendai Chikwanha", class: "10A", subject: "Mathematics", assignment: "Term 1 Exam", score: 91, maxScore: 100, date: "2025-03-15" },
  { id: "G004", studentId: "S003", studentName: "Rudo Mapfumo", class: "11B", subject: "Science", assignment: "Lab Report", score: 88, maxScore: 100, date: "2025-03-12" },
  { id: "G005", studentId: "S004", studentName: "Tatenda Ndlovu", class: "11A", subject: "History", assignment: "Research Paper", score: 76, maxScore: 100, date: "2025-03-18" },
  { id: "G006", studentId: "S005", studentName: "Farai Sibanda", class: "9A", subject: "Geography", assignment: "Map Quiz", score: 65, maxScore: 80, date: "2025-03-14" },
  { id: "G007", studentId: "S007", studentName: "Chipo Banda", class: "12A", subject: "Computer Science", assignment: "Project", score: 95, maxScore: 100, date: "2025-03-20" },
  { id: "G008", studentId: "S008", studentName: "Kudzai Zvobgo", class: "12A", subject: "Computer Science", assignment: "Project", score: 82, maxScore: 100, date: "2025-03-20" },
  { id: "G009", studentId: "S010", studentName: "Tafara Gumbo", class: "11A", subject: "History", assignment: "Research Paper", score: 79, maxScore: 100, date: "2025-03-18" },
  { id: "G010", studentId: "S006", studentName: "Nyasha Mutasa", class: "9B", subject: "Mathematics", assignment: "Homework 5", score: 18, maxScore: 20, date: "2025-03-19" },
];

export const demoEvents: Event[] = [
  { id: "E001", title: "Term 1 Final Exams", date: "2025-04-01", type: "exam" },
  { id: "E002", title: "Staff Meeting", date: "2025-03-28", type: "meeting" },
  { id: "E003", title: "Parents' Day", date: "2025-04-05", type: "event" },
  { id: "E004", title: "Independence Day Holiday", date: "2025-04-18", type: "holiday" },
  { id: "E005", title: "Science Fair", date: "2025-04-12", type: "event" },
];

export const getInitialData = () => ({
  students: [...demoStudents],
  teachers: [...demoTeachers],
  classes: [...demoClasses],
  attendance: [...demoAttendance],
  grades: [...demoGrades],
  events: [...demoEvents],
});

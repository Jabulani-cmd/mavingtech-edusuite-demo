/**
 * Where each photograph's faces sit, as CSS object-position values, so a wide or short crop
 * never cuts off heads. `d` is for desktop and wide frames, `m` for phones. Measured with face
 * detection and checked by eye; update when a photo is replaced.
 */
export type Focus = { d: string; m?: string };

export const focus = {
  heroStudents1: { d: "50% 14%", m: "55% 20%" },
  heroStudents2: { d: "50% 30%", m: "58% 35%" },
  heroStudents3: { d: "35% 0%" },
  heroStudents4: { d: "50% 62%", m: "45% 62%" },
  heroStudents5: { d: "50% 28%", m: "40% 30%" },
  heroSchool: { d: "50% 55%" },
  academicsComputers: { d: "50% 20%" },
  achievements: { d: "50% 52%", m: "50% 50%" },
  classroom: { d: "50% 40%" },
  sports: { d: "50% 12%" },
  currCs: { d: "50% 22%" },
  currMath: { d: "50% 45%" },
  currLit: { d: "50% 35%" },
  currSci: { d: "50% 30%" },
  currArts: { d: "50% 22%" },
  currPerf: { d: "50% 25%" },
  actSports: { d: "50% 46%" },
  actMusic: { d: "50% 20%" },
  actArts: { d: "50% 15%" },
  actClubs: { d: "50% 38%" },
} satisfies Record<string, Focus>;

/** Photos that people upload through the admin tools have no measured focus: bias the crop towards the top, where heads are. */
export const UPLOAD_POSITION = "50% 25%";

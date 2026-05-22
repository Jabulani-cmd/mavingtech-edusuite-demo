import PortalTimetableView from "@/components/allocation/PortalTimetableView";
import { useAllocation } from "@/contexts/AllocationContext";

export default function StudentMyTimetable() {
  const { classes } = useAllocation();
  const myClass = classes[0]; // demo: Grade 8A
  return (
    <PortalTimetableView
      mode="class"
      classId={myClass?.id}
      title={`Class Timetable — ${myClass?.name ?? ""}`}
      subtitle="Every period shows your subject, teacher and venue."
    />
  );
}

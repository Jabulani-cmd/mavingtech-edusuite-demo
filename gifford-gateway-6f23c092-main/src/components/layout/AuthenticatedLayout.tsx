import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import MessagingPanel from "@/components/MessagingPanel";

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  return (
    <>
      {children}
      {user && <MessagingPanel />}
    </>
  );
}

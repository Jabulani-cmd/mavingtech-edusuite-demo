import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import MessagingPanel from "@/components/MessagingPanel";
import LanguageToggle from "@/components/LanguageToggle";

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  return (
    <>
      {children}
      {user && <MessagingPanel />}
      <div className="fixed bottom-4 left-4 z-40">
        <LanguageToggle />
      </div>
    </>
  );
}

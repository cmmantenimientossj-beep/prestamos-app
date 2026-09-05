import { ReactNode } from "react";
import ClientLayout from "./ClientLayout";
import NotificationBell from "@/components/NotificationBell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ClientLayout notificationBell={<NotificationBell />}>
      {children}
    </ClientLayout>
  );
}

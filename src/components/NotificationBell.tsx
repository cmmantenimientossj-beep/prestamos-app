import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import NotificationDropdown from "./NotificationDropdown";
import { prisma } from "@/lib/prisma";

export default async function NotificationBell() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) return null;

  // Re-fetch users so Admin can select whom to send to
  const cobradores = session.user.role === "ADMIN" 
     ? await prisma.usuario.findMany({ where: { rol: "COBRADOR" }, select: { id: true, nombre: true } })
     : [];

  return (
    <NotificationDropdown 
      usuarioId={session.user.id} 
      role={session.user.role} 
      cobradoresDisponibles={cobradores} 
    />
  );
}

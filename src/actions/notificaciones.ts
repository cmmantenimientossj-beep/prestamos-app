"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getNotificaciones(usuarioId: string) {
  try {
    return await prisma.notificacion.findMany({
      where: { usuario_id: usuarioId },
      orderBy: { fecha: 'desc' },
      take: 20
    });
  } catch (error) {
    console.error("Error fetching notificaciones:", error);
    return [];
  }
}

export async function marcarNotificacionesLeidas(usuarioId: string) {
  try {
    await prisma.notificacion.updateMany({
      where: { usuario_id: usuarioId, leida: false },
      data: { leida: true }
    });
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Error marking notificaciones as read:", error);
    return { success: false, error: "Error interno." };
  }
}

export async function emitirMensajeManual(adminId: string, cobradorId: string, titulo: string, mensaje: string) {
  try {
    // Only admins generate manual links
    await prisma.notificacion.create({
      data: {
        usuario_id: cobradorId,
        titulo,
        mensaje
      }
    });

    await prisma.auditLog.create({
      data: {
        usuario_id: adminId,
        accion: "MENSAJE_ADMINISTRATIVO_ENVIADO",
        entidad_afectada: `Usuario_${cobradorId}`,
        valores_nuevos: mensaje
      }
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Error emitiendo notificacion manual", error);
    return { success: false, error: "No se pudo enviar el mensaje." }
  }
}

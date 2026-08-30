"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function solicitarRendicion(cobradorId: string, efectivo: number, transferencias: number, cantCuotas: number) {
  try {
    // Verificar si ya hay una pendiente
    const pendiente = await prisma.cajaRendicion.findFirst({
       where: { cobrador_id: cobradorId, estado: 'PENDIENTE' }
    });

    if (pendiente) {
      return { success: false, error: "Ya tienes una rendición pendiente de aprobación." };
    }

    const cobrador = await prisma.usuario.findUnique({ where: { id: cobradorId }});
    if (!cobrador) throw new Error("Cobrador not found");

    // Crear Rendicion PENDIENTE
    const rendicion = await prisma.cajaRendicion.create({
      data: {
        cobrador_id: cobradorId,
        fecha: new Date(),
        monto_efectivo: efectivo,
        monto_transferencias: transferencias,
        estado: 'PENDIENTE'
      }
    });

    // Notificar a todos los admins
    const admins = await prisma.usuario.findMany({ where: { rol: 'ADMIN' } });
    const notifPromises = admins.map(a => 
       prisma.notificacion.create({
         data: {
           usuario_id: a.id,
           titulo: `Rendición de ${cobrador.nombre}`,
           mensaje: `Solicita rendir un total de $${(efectivo + transferencias).toLocaleString('es-AR')} por ${cantCuotas} cuotas cobradas.`
         }
       })
    );
    await Promise.all(notifPromises);

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    console.error("Error soliciting rendicion:", error);
    return { success: false, error: error.message };
  }
}

export async function aprobarRendicion(rendicionId: string) {
  try {
     const rendicion = await prisma.cajaRendicion.findUnique({ where: { id: rendicionId } });
     if (!rendicion) return { success: false, error: "No encontrada" };
     if (rendicion.estado === 'APROBADA') return { success: false, error: "Ya aprobada" };

     await prisma.cajaRendicion.update({
       where: { id: rendicionId },
       data: { estado: 'APROBADA' }
     });

     // Notificar al cobrador
     await prisma.notificacion.create({
       data: {
         usuario_id: rendicion.cobrador_id,
         titulo: "Rendición Aprobada",
         mensaje: `Tu rendición por $${(rendicion.monto_efectivo + rendicion.monto_transferencias).toLocaleString('es-AR')} ha sido aceptada.`
       }
     });

     revalidatePath("/", "layout");
     return { success: true };
  } catch (err: any) {
     console.error(err);
     return { success: false, error: err.message };
  }
}

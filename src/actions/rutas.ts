"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getCobrosHoy(cobradorId: string) {
  // To handle timezone and "today" boundary safely in simple apps
  const hoy = new Date();
  hoy.setHours(23, 59, 59, 999);

  return prisma.cuota.findMany({
    where: {
      estado: { in: ['PENDIENTE', 'MORA', 'PARCIAL'] },
      // Traemos todo lo pendiente, o limitamos a fecha_vencimiento <= (hoy + 7 días) si queremos ser estrictos
      prestamo: {
        cobrador_id: cobradorId
      }
    },
    include: {
      prestamo: {
        include: {
          cliente: true
        }
      }
    },
    orderBy: {
      fecha_vencimiento: 'asc'
    }
  });
}

export async function cobrarCuota(cuotaId: string, montoPagado: number, medioPago: string = "EFECTIVO") {
  try {
    const currentCuota = await prisma.cuota.findUnique({
      where: { id: cuotaId }
    });
    
    if (!currentCuota) throw new Error("Cuota no encontrada");
    
    const newMontoPagado = currentCuota.monto_pagado + montoPagado;
    const isCompleted = newMontoPagado >= currentCuota.valor;
    
    await prisma.cuota.update({
      where: { id: cuotaId },
      data: {
        monto_pagado: newMontoPagado,
        estado: isCompleted ? "PAGADA" : "PARCIAL",
        medio_pago: medioPago,
        fecha_pago: new Date()
      }
    });

    revalidatePath("/", "layout");
    
    return { success: true };
  } catch (error) {
    console.error("Error cobrando cuota:", error);
    return { success: false, error: "Error interno al cobrar" };
  }
}

export async function reprogramarCuota(cuotaId: string, nuevaFecha: Date) {
  try {
    await prisma.cuota.update({
      where: { id: cuotaId },
      data: { fecha_vencimiento: nuevaFecha }
    });
    
    revalidatePath("/", "layout");
    
    return { success: true };
  } catch (error) {
    console.error("Error al reprogramar:", error);
    return { success: false, error: "Error interno al reprogramar" };
  }
}

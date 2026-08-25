"use server";

import { prisma } from "@/lib/prisma";
import { generatePaymentSchedule, LoanParams, ModalidadPrestamo } from "@/lib/loan-calculator";
import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";

export interface CreatePrestamoInput {
  cliente_id: string;
  cobrador_id: string;
  monto_solicitado: number;
  porcentaje_interes: number;
  cantidad_cuotas: number;
  modalidad: ModalidadPrestamo;
  tipo: string;
  fecha_entrega: Date;
  fecha_primer_cobro: Date;
}

export async function createPrestamo(data: CreatePrestamoInput) {
  try {
    // 1. Calculate schedule and amounts
    const { montoTotalDevolver, valorCuota, cuotas } = generatePaymentSchedule({
      monto_solicitado: data.monto_solicitado,
      porcentaje_interes: data.porcentaje_interes,
      cantidad_cuotas: data.cantidad_cuotas,
      modalidad: data.modalidad,
      fecha_inicio: data.fecha_primer_cobro,
    });

    // 2. Generate unique code
    const shortHash = randomBytes(3).toString("hex").toUpperCase();
    const codigo = `ПРE-${shortHash}`; // Example: PRE-A1B2C3

    // 3. Prisma Transaction to ensure Data Integrity
    const prestamo = await prisma.$transaction(async (tx: any) => {
      const nuevoPrestamo = await tx.prestamo.create({
        data: {
          codigo,
          cliente_id: data.cliente_id,
          cobrador_id: data.cobrador_id,
          monto_solicitado: data.monto_solicitado,
          porcentaje_interes: data.porcentaje_interes,
          cantidad_cuotas: data.cantidad_cuotas,
          modalidad: data.modalidad,
          tipo: data.tipo,
          fecha_entrega: data.fecha_entrega,
          fecha_primer_cobro: data.fecha_primer_cobro,
          monto_total_a_devolver: montoTotalDevolver,
          valor_cuota: valorCuota,
          cuotas: {
            create: cuotas.map((c) => ({
              numero_cuota: c.numero_cuota,
              fecha_vencimiento: c.fecha_vencimiento,
              valor: c.valor,
            })),
          },
        },
      });

      // Optional: Insert AuditLog
      await tx.auditLog.create({
        data: {
          usuario_id: data.cobrador_id,
          accion: "CREAR_PRESTAMO",
          entidad_afectada: `Prestamo_${nuevoPrestamo.id}`,
          valores_nuevos: JSON.stringify(nuevoPrestamo),
        },
      });

      return nuevoPrestamo;
    });

    revalidatePath("/(cobrador)/nuevo-prestamo");
    revalidatePath("/(cobrador)/resumen");
    
    return { success: true, prestamo };
  } catch (error: any) {
    console.error("Error creating prestamo:", error);
    return { success: false, error: "Failed to create prestamo" };
  }
}

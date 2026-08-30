"use server";

import { prisma } from "@/lib/prisma";
import { ModalidadPrestamo, generatePaymentSchedule } from "@/lib/loan-calculator";
import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";

export interface CreatePrestamoInput {
  cliente_id: string; // "NUEVO" or existoso
  cobrador_id: string;
  monto_solicitado: number;
  porcentaje_interes: number;
  cantidad_cuotas: number;
  modalidad: ModalidadPrestamo;
  tipo: string;
  fecha_entrega: Date;
  fecha_primer_cobro: Date;
  
  cliente_nuevo_nombre?: string;
  cliente_nuevo_direccion?: string;
  cliente_nuevo_celular?: string;
}

export async function createPrestamo(data: CreatePrestamoInput) {
  try {
    const isNew = data.cliente_id === "NUEVO";
    
    // Almacenamos temporalmente como una Solicitud, NO como Cliente o Préstamo real
    const sol = await prisma.solicitudPrestamo.create({
      data: {
        cobrador_id: data.cobrador_id,
        cliente_id: isNew ? null : data.cliente_id,
        nuevo_cliente_nombre_apellido: isNew ? data.cliente_nuevo_nombre : null,
        nuevo_cliente_direccion_personal: isNew ? data.cliente_nuevo_direccion : null,
        nuevo_cliente_celular: isNew ? data.cliente_nuevo_celular : null,
        monto_solicitado: data.monto_solicitado,
        porcentaje_interes: data.porcentaje_interes,
        cantidad_cuotas: data.cantidad_cuotas,
        modalidad: data.modalidad,
        tipo: data.tipo,
        fecha_entrega: data.fecha_entrega,
        fecha_primer_cobro: data.fecha_primer_cobro,
        estado: "PENDIENTE"
      }
    });

    await prisma.auditLog.create({
      data: {
        usuario_id: data.cobrador_id,
        accion: "ENVIAR_SOLICITUD_BORRADOR",
        entidad_afectada: `Solicitud_${sol.id}`,
        valores_nuevos: JSON.stringify({ meta: "Nueva solicitud segura", solicitud_id: sol.id }),
      },
    });

    revalidatePath("/", "layout");
    
    return { success: true, prestamo: sol };
  } catch (error: any) {
    console.error("Error creating solicitud:", error);
    return { success: false, error: "Fallo al enviar la solicitud al servidor: " + error.message };
  }
}

export async function approvePrestamo(id: string) {
  try {
    const solicitud = await prisma.solicitudPrestamo.findUnique({
       where: { id }
    });
    if (!solicitud || solicitud.estado !== "PENDIENTE") {
      throw new Error("Solicitud inválida o ya procesada por otro administrador.");
    }
    
    // Generar cuadro de pagos matemáticamente
    const { montoTotalDevolver, valorCuota, cuotas } = generatePaymentSchedule({
      monto_solicitado: solicitud.monto_solicitado,
      porcentaje_interes: solicitud.porcentaje_interes,
      cantidad_cuotas: Math.floor(solicitud.cantidad_cuotas),
      modalidad: solicitud.modalidad as ModalidadPrestamo,
      fecha_inicio: solicitud.fecha_primer_cobro,
    });

    const shortHash = randomBytes(3).toString("hex").toUpperCase();
    const codigo = `PRE-${shortHash}`;

    // Alta Oficial (Transacción a prueba de fallos)
    await prisma.$transaction(async (tx: any) => {
      let activeClienteId = solicitud.cliente_id;

      if (!activeClienteId) {
         // Crear el cliente oficial en base a la solicitud
         const nc = await tx.cliente.create({
            data: {
               nombre_apellido: solicitud.nuevo_cliente_nombre_apellido || "Desconocido",
               direccion_personal: solicitud.nuevo_cliente_direccion_personal || null,
               celular: solicitud.nuevo_cliente_celular || null,
               // Auto-generamos un DNI temporal para cumplir con el esquema único si no fue proporcionado
               dni: `TEMP-${randomBytes(4).toString("hex").toUpperCase()}`
            }
         });
         activeClienteId = nc.id;
      }

      // Alta del préstamo activo
      const nuevoP = await tx.prestamo.create({
        data: {
          codigo,
          cliente_id: activeClienteId,
          cobrador_id: solicitud.cobrador_id,
          monto_solicitado: solicitud.monto_solicitado,
          porcentaje_interes: solicitud.porcentaje_interes,
          cantidad_cuotas: solicitud.cantidad_cuotas,
          modalidad: solicitud.modalidad,
          tipo: solicitud.tipo,
          estado: 'ACTIVO',
          fecha_entrega: solicitud.fecha_entrega,
          fecha_primer_cobro: solicitud.fecha_primer_cobro,
          monto_total_a_devolver: montoTotalDevolver,
          valor_cuota: valorCuota,
          cuotas: {
            create: cuotas.map((c: any) => ({
              numero_cuota: c.numero_cuota,
              fecha_vencimiento: c.fecha_vencimiento,
              valor: c.valor,
            })),
          },
        },
      });

      // Archivar solicitud
      await tx.solicitudPrestamo.update({
         where: { id: solicitud.id },
         data: { estado: "APROBADA" }
      });
      
      await tx.auditLog.create({
        data: {
          usuario_id: solicitud.cobrador_id,
          accion: "PRESTAMO_OFICIALIZADO_ADMIN",
          entidad_afectada: `Prestamo_${nuevoP.id}`,
          valores_nuevos: JSON.stringify({ pre: codigo, monto: solicitud.monto_solicitado }),
        },
      });
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    console.error("Error approving prestamo:", error);
    return { success: false, error: error.message || "Failed to approve prestamo" };
  }
}

"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCliente(data: {
  nombre_apellido: string;
  dni: string;
  celular?: string;
  direccion_personal?: string;
  direccion_negocio?: string;
  nombre_negocio?: string;
}) {
  try {
    const nuevoCliente = await prisma.cliente.create({
      data: {
        nombre_apellido: data.nombre_apellido,
        dni: data.dni,
        celular: data.celular,
        direccion_personal: data.direccion_personal,
        direccion_negocio: data.direccion_negocio,
        nombre_negocio: data.nombre_negocio,
      },
    });

    revalidatePath("/", "layout");
    return { success: true, cliente: nuevoCliente };
  } catch (error: any) {
    console.error("Error creating client:", error);
    if (error.code === 'P2002') {
       return { success: false, error: "El DNI ingresado ya está registrado." };
    }
    return { success: false, error: "Error interno: " + error.message };
  }
}

export async function deleteCliente(id: string, pin?: string) {
  try {
    if (pin !== "2510") {
      return { success: false, error: "Fallo de seguridad: PIN maestro incorrecto o ausente." };
    }

    // Usar transacción para borrar en cascada y asegurar que no queden datos huérfanos
    await prisma.$transaction(async (tx) => {
      // 1. Obtener todos los préstamos del cliente
      const prestamos = await tx.prestamo.findMany({ 
        where: { cliente_id: id }, 
        select: { id: true } 
      });
      const prestamoIds = prestamos.map(p => p.id);
      
      // 2. Borrar todas las cuotas de esos préstamos
      if (prestamoIds.length > 0) {
        await tx.cuota.deleteMany({
          where: { prestamo_id: { in: prestamoIds } }
        });
      }

      // 3. Borrar los préstamos
      await tx.prestamo.deleteMany({
        where: { cliente_id: id }
      });

      // 4. Borrar las solicitudes de préstamo del cliente
      await tx.solicitudPrestamo.deleteMany({
        where: { cliente_id: id }
      });

      // 5. Finalmente, borrar el cliente
      await tx.cliente.delete({
        where: { id },
      });
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting client:", error);
    return { success: false, error: "Error interno al intentar purgar los datos del cliente: " + error.message };
  }
}

export async function updateClienteCrm(id: string, notas_internas: string, calificacion: string) {
  try {
    await prisma.cliente.update({
      where: { id },
      data: {
        notas_internas: notas_internas || null,
        calificacion: calificacion as any
      }
    });

    revalidatePath("/admin/clientes/[id]", "page");
    revalidatePath("/admin/clientes", "page");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating CRM data:", error);
    return { success: false, error: "No se pudo actualizar el perfil avanzado del cliente." };
  }
}

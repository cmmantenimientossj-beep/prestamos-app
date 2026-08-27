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
    return { success: false, error: "Error interno al crear cliente." };
  }
}

export async function deleteCliente(id: string) {
  try {
    const prestamosActivos = await prisma.prestamo.count({
      where: {
        cliente_id: id,
        estado: { notIn: ['PAGADO', 'ANULADO'] },
      },
    });

    if (prestamosActivos > 0) {
      return { success: false, error: "No se puede eliminar un cliente con préstamos activos." };
    }

    // Delete related closed loans first, or just rely on cascade (schema doesn't have cascade right now)
    // To keep it simple, we'll try to delete. If they have ANY loans, it will throw foreign key error.
    await prisma.cliente.delete({
      where: { id },
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Error deleting client:", error);
    return { success: false, error: "El cliente tiene un historial de préstamos o cuotas que impide su eliminación." };
  }
}

"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCobrador(data: {
  nombre: string;
  email: string;
  password_hash: string;
  dni?: string;
  celular?: string;
  direccion?: string;
}) {
  try {
    const nuevoCobrador = await prisma.usuario.create({
      data: {
        nombre: data.nombre,
        email: data.email,
        password_hash: data.password_hash, // Currently storing plaintext according to auth.ts
        rol: "COBRADOR",
        estado: "ACTIVO",
        dni: data.dni,
        celular: data.celular,
        direccion: data.direccion,
      },
    });

    revalidatePath("/", "layout");
    return { success: true, cobrador: nuevoCobrador };
  } catch (error: any) {
    if (error.code === 'P2002') return { success: false, error: "El email o DNI ya está registrado." };
    return { success: false, error: "Error al crear el cobrador." };
  }
}

export async function toggleCobradorStatus(id: string, currentStatus: string) {
  try {
    const newStatus = currentStatus === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    await prisma.usuario.update({
      where: { id },
      data: { estado: newStatus }
    });

    revalidatePath("/", "layout");
    return { success: true, newStatus };
  } catch (error) {
    return { success: false, error: "Error al cambiar estado del cobrador." };
  }
}

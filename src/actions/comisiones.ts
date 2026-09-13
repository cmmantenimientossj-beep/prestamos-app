"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addComision(nombre: string, monto: number) {
  try {
    const comision = await prisma.gasto.create({
      data: {
        motivo: `Comisión para: ${nombre}`,
        monto: monto
      }
    });

    revalidatePath("/admin/comisiones", "page");
    revalidatePath("/admin/resumen", "page");
    return { success: true, comision };
  } catch (error: any) {
    console.error("Error al registrar comisión:", error);
    return { success: false, error: "Ocurrió un error al intentar registrar la comisión. Intenta nuevamente." };
  }
}

export async function deleteComision(id: string) {
  try {
    await prisma.gasto.delete({ where: { id } });
    revalidatePath("/admin/comisiones", "page");
    revalidatePath("/admin/resumen", "page");
    return { success: true };
  } catch (error) {
    console.error("Error al anular comisión:", error);
    return { success: false, error: "No se pudo anular la comisión." };
  }
}

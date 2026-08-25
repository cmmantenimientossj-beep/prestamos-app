import { prisma } from "./prisma";

export async function logAudit(
  usuarioId: string, 
  accion: string, 
  entidadAfectada: string, 
  valoresAnteriores: any = null, 
  valoresNuevos: any = null
) {
  try {
    await prisma.auditLog.create({
      data: {
        usuario_id: usuarioId,
        accion: accion,
        entidad_afectada: entidadAfectada,
        valores_anteriores: valoresAnteriores,
        valores_nuevos: valoresNuevos
      }
    });
  } catch (error) {
    console.error("Fallo al registrar log de auditoría financiera", error);
    // Aquí se omitiría fallar toda la transacción en un diseño suave,
    // o se usaría una Prisma Transaction explícita ($transaction) en diseños rígidos.
  }
}

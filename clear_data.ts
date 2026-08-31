import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearDatabase() {
  console.log("Limpiando registros transaccionales...");

  try {
    // 1. Borrar auditoria
    await prisma.auditLog.deleteMany({});
    console.log("✅ Logs de auditoría borrados");

    // 2. Borrar cuotas
    await prisma.cuota.deleteMany({});
    console.log("✅ Cuotas borradas");

    // 3. Borrar prestamos
    await prisma.prestamo.deleteMany({});
    console.log("✅ Préstamos borrados");

    // 4. Borrar rendiciones
    await prisma.cajaRendicion.deleteMany({});
    console.log("✅ Rendiciones borradas");

    // 5. Borrar solicitudes
    await prisma.solicitudPrestamo.deleteMany({});
    console.log("✅ Solicitudes de préstamo borradas");

    // 6. Borrar clientes
    await prisma.cliente.deleteMany({});
    console.log("✅ Clientes borrados");

    // 7. Borrar notificaciones
    await prisma.notificacion.deleteMany({});
    console.log("✅ Notificaciones borradas");

    console.log("\nLimpieza completada con éxito. Usuarios y administradores se mantienen intactos.");
  } catch (error) {
    console.error("Error durante la limpieza:", error);
  } finally {
    await prisma.$disconnect();
  }
}

clearDatabase();

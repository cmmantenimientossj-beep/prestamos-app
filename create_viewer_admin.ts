import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createViewerAdmin() {
  console.log("Creando administrador de solo lectura (rcaballero)...");
  
  // Limpiar primero si el usuario ya existe por si acaso
  const user = await prisma.usuario.findFirst({
    where: { email: 'rcaballero' }
  });

  if (user) {
    console.log("El usuario rcaballero ya existía, actualizando su rol y clave...");
    await prisma.usuario.update({
      where: { id: user.id },
      data: {
        password_hash: '21895291',
        rol: 'ADMIN_VIEWER',
        estado: 'ACTIVO'
      }
    });
  } else {
    await prisma.usuario.create({
      data: {
        nombre: 'Ricardo Caballero (Auditor)',
        email: 'rcaballero',
        password_hash: '21895291',
        rol: 'ADMIN_VIEWER',
        estado: 'ACTIVO'
      }
    });
  }

  console.log("Administrador creado exitosamente.");
}

createViewerAdmin()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

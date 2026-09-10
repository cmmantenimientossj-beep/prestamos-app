import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateAdmins() {
  console.log("Removing existing admins...");
  await prisma.usuario.deleteMany({
    where: {
      rol: 'ADMIN'
    }
  });

  console.log("Creating new admins...");
  await prisma.usuario.createMany({
    data: [
      {
        nombre: 'Administrador 1',
        email: 'cmiranda',
        password_hash: '251008',
        rol: 'ADMIN',
        estado: 'ACTIVO'
      },
      {
        nombre: 'Administrador 2',
        email: 'cinarrebola',
        password_hash: '251008',
        rol: 'ADMIN',
        estado: 'ACTIVO'
      }
    ]
  });

  console.log("Admins successfully updated!");
}

updateAdmins()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

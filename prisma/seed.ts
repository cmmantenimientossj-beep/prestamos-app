import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@ryb.com' },
    update: {},
    create: {
      email: 'admin@ryb.com',
      nombre: 'Admin Principal RYB',
      password_hash: 'admin123', 
      rol: 'ADMIN',
    },
  });

  const cobrador = await prisma.usuario.upsert({
    where: { email: 'cobrador@ryb.com' },
    update: {},
    create: {
      email: 'cobrador@ryb.com',
      nombre: 'Cobrador RYB (Pruebas)',
      password_hash: 'cobrador123', 
      rol: 'COBRADOR',
    },
  });

  const cliente1 = await prisma.cliente.upsert({
    where: { dni: '12345678' },
    update: {},
    create: {
      nombre_apellido: 'Kiosco "La Esquina" - Juan Pérez',
      dni: '12345678',
      direccion_negocio: 'Av. Libertador 1234',
      cobrador_asignado_id: cobrador.id
    }
  });

  const cliente2 = await prisma.cliente.upsert({
    where: { dni: '87654321' },
    update: {},
    create: {
      nombre_apellido: 'Despensa Maria',
      dni: '87654321',
      direccion_negocio: 'Calle 8 Nro 432',
      cobrador_asignado_id: cobrador.id
    }
  });

  console.log("Database Seed completed successfully:", { admin, cobrador })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

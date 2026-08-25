"use server";

import { prisma } from "@/lib/prisma";

export async function getDashboardMetrics() {
  // 1. Capital Activo (Suma del monto a devolver de préstamos activos)
  // O alternativamente, suma de las cuotas pendientes. Sumaremos cuotas PENDIENTES o MORA.
  const cuotasActivas = await prisma.cuota.aggregate({
    _sum: {
      valor: true,
      monto_pagado: true,
    },
    where: {
      estado: {
        in: ['PENDIENTE', 'MORA', 'PARCIAL'],
      },
    },
  });

  const capitalActivo = (cuotasActivas._sum.valor || 0) - (cuotasActivas._sum.monto_pagado || 0);

  // 2. Clientes Activos
  const clientesActivos = await prisma.cliente.count({
    where: {
      prestamos: {
        some: {
          estado: 'ACTIVO',
        },
      },
    },
  });

  // 3. Índice de Morosidad
  const totalCuotas = await prisma.cuota.count({
    where: {
      estado: {
        in: ['PENDIENTE', 'MORA', 'PARCIAL'],
      },
    },
  });

  const cuotasMora = await prisma.cuota.count({
    where: {
      estado: 'MORA',
    },
  });

  const morosidad = totalCuotas > 0 ? (cuotasMora / totalCuotas) * 100 : 0;

  // 4. Rendiciones Recientes
  const rendiciones = await prisma.cajaRendicion.findMany({
    take: 5,
    orderBy: {
      fecha: 'desc',
    },
    include: {
      cobrador: {
        select: {
          nombre: true,
        },
      },
    },
  });

  return {
    capitalActivo,
    clientesActivos,
    morosidad: morosidad.toFixed(1),
    rendiciones,
  };
}

"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

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

// ---- Nuevas Funciones de Capital y Gastos ----

export async function getCapitalInvertido() {
  const config = await prisma.configuracion.findUnique({
    where: { clave: 'capital_invertido' }
  });
  return config ? parseFloat(config.valor) : 0;
}

export async function setCapitalInvertido(monto: number) {
  await prisma.configuracion.upsert({
    where: { clave: 'capital_invertido' },
    update: { valor: monto.toString() },
    create: { clave: 'capital_invertido', valor: monto.toString() }
  });
}

export async function getGastosAllTime() {
  const sum = await prisma.gasto.aggregate({
    _sum: {
      monto: true,
    }
  });
  return sum._sum.monto || 0;
}

export async function addGasto(motivo: string, monto: number) {
  await prisma.gasto.create({
    data: {
      motivo,
      monto,
    }
  });
}

/**
 * Permite asentar el pago de una cuota desde el panel de administración.
 * REGLA DE SEGURIDAD: Únicamente el administrador principal con usuario/email "cmiranda"
 * puede ejecutar esta acción. Al confirmarse, emite una notificación al cobrador asignado.
 */
export async function asentarPagoPorAdmin(
  cuotaId: string, 
  monto: number, 
  medioPago: string = "TRANSFERENCIA"
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return { success: false, error: "No autenticado. Por favor inicie sesión." };
    }

    // Validación estricta en base de datos: solo el administrador cmiranda tiene autorización
    const usuario = await prisma.usuario.findUnique({
      where: { id: session.user.id }
    });

    if (!usuario || usuario.rol !== "ADMIN" || usuario.email !== "cmiranda") {
      return { 
        success: false, 
        error: "Acceso denegado: Solo el administrador cmiranda está autorizado a asentar pagos desde el panel." 
      };
    }

    if (monto <= 0) {
      return { success: false, error: "El monto a asentar debe ser mayor a 0." };
    }

    const cuota = await prisma.cuota.findUnique({
      where: { id: cuotaId },
      include: {
        prestamo: {
          include: {
            cliente: true,
            cobrador: true
          }
        }
      }
    });

    if (!cuota) {
      return { success: false, error: "Cuota no encontrada." };
    }

    if (cuota.estado === "PAGADA" || cuota.monto_pagado >= cuota.valor) {
      return { success: false, error: "Esta cuota ya se encuentra totalmente cancelada." };
    }

    const saldoPendiente = cuota.valor - cuota.monto_pagado;
    if (monto > saldoPendiente) {
      return { 
        success: false, 
        error: `El monto ingresado ($${monto.toLocaleString('es-AR')}) excede el saldo restante de la cuota ($${saldoPendiente.toLocaleString('es-AR')}).` 
      };
    }

    const nuevoMontoPagado = cuota.monto_pagado + monto;
    const isCompleted = nuevoMontoPagado >= cuota.valor;

    // Actualizar la cuota
    await prisma.cuota.update({
      where: { id: cuotaId },
      data: {
        monto_pagado: nuevoMontoPagado,
        estado: isCompleted ? "PAGADA" : "PARCIAL",
        medio_pago: medioPago,
        fecha_pago: new Date()
      }
    });

    // Verificar si el préstamo se canceló en su totalidad
    if (isCompleted) {
      const cuotasRestantes = await prisma.cuota.count({
        where: {
          prestamo_id: cuota.prestamo_id,
          estado: { not: "PAGADA" }
        }
      });
      if (cuotasRestantes === 0) {
        await prisma.prestamo.update({
          where: { id: cuota.prestamo_id },
          data: { estado: "PAGADO" }
        });
      }
    }

    // Registrar en auditoría
    await prisma.auditLog.create({
      data: {
        usuario_id: usuario.id,
        accion: "PAGO_ASENTADO_ADMIN",
        entidad_afectada: `Cuota_${cuota.id}`,
        valores_nuevos: JSON.stringify({
          monto,
          medioPago,
          cuotaNumero: cuota.numero_cuota,
          cliente: cuota.prestamo.cliente.nombre_apellido,
          prestamoCodigo: cuota.prestamo.codigo
        })
      }
    });

    // Notificar al Cobrador asignado
    const cobradorId = cuota.prestamo.cobrador_id;
    if (cobradorId) {
      const nombreAdmin = usuario.nombre || "cmiranda";
      const montoFormateado = monto.toLocaleString('es-AR');
      const clienteNombre = cuota.prestamo.cliente.nombre_apellido;
      const cuotaNum = cuota.numero_cuota;
      const codigoPrestamo = cuota.prestamo.codigo;

      await prisma.notificacion.create({
        data: {
          usuario_id: cobradorId,
          titulo: "Pago Asentado por Administración",
          mensaje: `El administrador ${nombreAdmin} asentó el pago de $${montoFormateado} (${medioPago}) para la cuota N°${cuotaNum} de ${clienteNombre} (Ref: ${codigoPrestamo}). Ya no es necesario cobrar este valor en la ruta.`
        }
      });
    }

    revalidatePath("/", "layout");
    revalidatePath(`/admin/clientes/${cuota.prestamo.cliente_id}`);
    revalidatePath("/admin/cobro-semanal");
    revalidatePath("/mis-rutas");

    return { success: true };
  } catch (error) {
    console.error("Error asentando pago por admin:", error);
    return { success: false, error: "Ocurrió un error interno al asentar el pago." };
  }
}


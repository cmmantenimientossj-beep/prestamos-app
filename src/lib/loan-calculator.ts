/**
 * Genera el cronograma de cuotas (fechas de vencimiento y montos)
 * basado en las reglas financieras definidas por la empresa.
 */

export type ModalidadPrestamo = "DIARIA" | "SEMANAL" | "QUINCENAL" | "MENSUAL";

export interface LoanParams {
  monto_solicitado: number;
  porcentaje_interes: number; // Ej: 20 para 20%
  cantidad_cuotas: number;
  modalidad: ModalidadPrestamo;
  fecha_inicio: Date; // Fecha del primer cobro
}

export function generatePaymentSchedule(params: LoanParams) {
  const { monto_solicitado, porcentaje_interes, cantidad_cuotas, modalidad, fecha_inicio } = params;

  // Cálculo del monto total a devolver (Interés simple sobre capital)
  const interesTotal = (monto_solicitado * porcentaje_interes) / 100;
  const montoTotalDevolver = monto_solicitado + interesTotal;
  
  // Valor de cuota
  const valorCuotaExacto = montoTotalDevolver / cantidad_cuotas;
  
  // Redondeamos el valor de la cuota (opcionalmente configurable)
  const valorCuota = Math.round(valorCuotaExacto * 100) / 100;

  const cuotas = [];
  let currentDate = new Date(fecha_inicio);

  for (let i = 1; i <= cantidad_cuotas; i++) {
    cuotas.push({
      numero_cuota: i,
      // La última cuota ajusta los centavos sobrantes
      valor: i === cantidad_cuotas 
               ? Math.round((montoTotalDevolver - (valorCuota * (cantidad_cuotas - 1))) * 100) / 100 
               : valorCuota,
      fecha_vencimiento: new Date(currentDate)
    });

    currentDate = getNextDate(currentDate, modalidad);
  }

  return {
    montoTotalDevolver,
    valorCuota,
    cuotas
  };
}

function getNextDate(current: Date, modalidad: ModalidadPrestamo): Date {
  const next = new Date(current);
  
  switch (modalidad) {
    case "DIARIA":
      next.setDate(next.getDate() + 1);
      // Los domingos normalmente no se cobra (día inhábil comercial en este rubro)
      if (next.getDay() === 0) {
        next.setDate(next.getDate() + 1);
      }
      break;
    case "SEMANAL":
      next.setDate(next.getDate() + 7);
      break;
    case "QUINCENAL":
      next.setDate(next.getDate() + 15);
      break;
    case "MENSUAL":
      next.setMonth(next.getMonth() + 1);
      break;
  }
  
  return next;
}

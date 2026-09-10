import { prisma } from "@/lib/prisma";
import AgendaSemanalUI from "./AgendaSemanalUI";
import { startOfWeek, addDays, startOfDay, endOfDay } from "date-fns";

export default async function CobroSemanalPage() {
  const today = new Date();
  
  // Semana de Lunes (1) a Sábado (6)
  const monday = startOfWeek(today, { weekStartsOn: 1 });
  const start = startOfDay(monday);
  const saturday = addDays(monday, 5);
  const end = endOfDay(saturday);

  const cuotas = await prisma.cuota.findMany({
    where: {
      fecha_vencimiento: {
        gte: start,
        lte: end
      }
    },
    include: {
      prestamo: {
        include: {
          cliente: { select: { nombre_apellido: true, direccion_personal: true, celular: true, direccion_negocio: true } },
          cobrador: { select: { id: true, nombre: true } }
        }
      }
    },
    orderBy: {
      fecha_vencimiento: 'asc'
    }
  });

  const cobradores = await prisma.usuario.findMany({
    where: { rol: 'COBRADOR' },
    select: { id: true, nombre: true }
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
       <AgendaSemanalUI cuotas={cuotas} cobradores={cobradores} />
    </div>
  );
}

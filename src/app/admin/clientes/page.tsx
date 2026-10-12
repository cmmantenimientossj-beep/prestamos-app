import { prisma } from "@/lib/prisma";
import ClientManager from "./ClientManager";

export default async function ClientesPage() {
  const clientesRaw = await prisma.cliente.findMany({
    include: {
      _count: {
        select: {
          prestamos: true
        }
      },
      prestamos: {
        where: { estado: { in: ['ACTIVO', 'MORA'] } },
        select: { 
          id: true,
          estado: true,
          cuotas: {
            where: {
              estado: { in: ['PENDIENTE', 'MORA', 'PARCIAL'] }
            },
            select: {
              fecha_vencimiento: true,
              estado: true
            }
          }
        }
      }
    },
    orderBy: { nombre_apellido: 'asc' }
  });

  const now = new Date();

  const clientes = clientesRaw.map(c => {
    const hasActiveLoans = c.prestamos && c.prestamos.length > 0;
    
    let estadoFinanciero: 'AL_DIA' | 'CON_ATRASO' | 'EN_MORA' | 'SIN_DEUDA' = 'SIN_DEUDA';
    let cuotasAtrasadasCount = 0;

    if (hasActiveLoans) {
      c.prestamos.forEach(p => {
        p.cuotas.forEach(cuota => {
          if (new Date(cuota.fecha_vencimiento) < now) {
            cuotasAtrasadasCount++;
          }
        });
      });

      const anyLoanMora = c.prestamos.some(p => p.estado === 'MORA');

      if (cuotasAtrasadasCount === 0 && !anyLoanMora) {
        estadoFinanciero = 'AL_DIA';
      } else if (cuotasAtrasadasCount <= 2 && !anyLoanMora) {
        estadoFinanciero = 'CON_ATRASO';
      } else {
        estadoFinanciero = 'EN_MORA';
      }
    }

    return {
      ...c,
      estadoFinanciero,
      cuotasAtrasadasCount
    };
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
       <ClientManager initialClientes={clientes} />
    </div>
  );
}

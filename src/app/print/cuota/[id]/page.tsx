import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import PrintClientWrapper from "@/components/PrintClientWrapper";

export default async function TicketCuotaPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const cuotaId = resolvedParams.id;
  
  const cuota = await prisma.cuota.findUnique({
    where: { id: cuotaId },
    include: { prestamo: { include: { cliente: true, cobrador: true } } }
  });

  if (!cuota) return <div className="p-4">Cuota no encontrada</div>;

  return (
    <PrintClientWrapper>
      <div className="p-2 text-center border-b border-black/20 pb-4 mb-4">
        <h1 className="text-xl font-black uppercase mb-1">RYB</h1>
        <p className="text-xs uppercase font-bold">Comprobante de Pago</p>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between border-b border-black/10 pb-1">
          <span className="font-bold">FECHA:</span>
          <span>{cuota.fecha_pago ? format(cuota.fecha_pago, 'dd/MM/yyyy HH:mm') : '-'}</span>
        </div>
        <div className="flex justify-between border-b border-black/10 pb-1">
          <span className="font-bold">CLIENTE:</span>
          <span className="text-right truncate ml-2">{cuota.prestamo.cliente.nombre_apellido}</span>
        </div>
        <div className="flex justify-between border-b border-black/10 pb-1">
          <span className="font-bold">COBRADOR:</span>
          <span className="text-right truncate ml-2">{cuota.prestamo.cobrador.nombre}</span>
        </div>
        <div className="flex justify-between border-b border-black/10 pb-1">
          <span className="font-bold">CUOTA NRO:</span>
          <span>{cuota.numero_cuota} de {cuota.prestamo.cantidad_cuotas}</span>
        </div>
      </div>

      <div className="mb-4 text-center">
        <p className="font-bold text-[10px] mb-1">IMPORTE PAGADO</p>
        <p className="text-2xl font-black border-y-2 border-black py-1">
           ${cuota.monto_pagado.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
        </p>
      </div>

      <div className="text-center text-[10px] space-y-1 mb-8">
        <p>Gracias por su pago.</p>
        <p>CONSERVE ESTE TICKET</p>
        <p className="mt-2">RYB Sistema de Cobros</p>
      </div>
      
    </PrintClientWrapper>
  );
}

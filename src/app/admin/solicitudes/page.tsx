import { prisma } from "@/lib/prisma";
import SolicitudesList from "./SolicitudesList";
import { ClipboardList } from "lucide-react";

export default async function SolicitudesPage() {
  const rawSolicitudes = await prisma.solicitudPrestamo.findMany({
    where: { estado: 'PENDIENTE' },
    include: { cliente: true, cobrador: true },
    orderBy: { fecha_registro: 'desc' }
  });

  // Sanitizamos las fechas para evitar problemas de hidratación (Next.js server to client issues)
  const solicitudes = rawSolicitudes.map((s: any) => ({
    ...s,
    fecha_entrega: s.fecha_entrega.toISOString(),
    fecha_primer_cobro: s.fecha_primer_cobro.toISOString(),
    fecha_registro: s.fecha_registro.toISOString(),
    cliente: s.cliente ? { ...s.cliente, fecha_registro: s.cliente.fecha_registro.toISOString() } : null,
  }));

  // Removemos la animación 'slide-in' porque al aplicar un 'transform' css en el contenedor,
  // rompe la propiedad 'fixed inset-0' del Modal hijo en algunos dispositivos.
  return (
    <div className="pb-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Solicitudes de Crédito</h1>
        <p className="text-slate-500 mt-1">Evalúa, aprueba y emite formalmente los préstamos generados por los cobradores.</p>
      </div>

      <SolicitudesList solicitudes={solicitudes as any} />
    </div>
  );
}

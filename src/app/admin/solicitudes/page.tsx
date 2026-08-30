import { prisma } from "@/lib/prisma";
import SolicitudesList from "./SolicitudesList";
import { ClipboardList } from "lucide-react";

export default async function SolicitudesPage() {
  const solicitudes = await prisma.solicitudPrestamo.findMany({
    where: { estado: 'PENDIENTE' },
    include: { cliente: true, cobrador: true },
    orderBy: { fecha_registro: 'desc' }
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Solicitudes de Crédito</h1>
        <p className="text-slate-500 mt-1">Evalúa, aprueba y emite formalmente los préstamos generados por los cobradores.</p>
      </div>

      <SolicitudesList solicitudes={solicitudes} />
    </div>
  );
}

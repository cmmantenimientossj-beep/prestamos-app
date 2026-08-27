import { prisma } from "@/lib/prisma";
import RecaudacionesDashboard from "./RecaudacionesDashboard";

export default async function RecaudacionesPage() {
  const cobradores = await prisma.usuario.findMany({ 
    where: { rol: "COBRADOR" }, 
    select: { id: true, nombre: true } 
  });
  
  // Extraemos todas las rendiciones (registros contables creados por los cobradores)
  const rendicionesRaw = await prisma.cajaRendicion.findMany({
    orderBy: { fecha: 'desc' },
    include: { cobrador: { select: { nombre: true } } }
  });

  // Convertimos las fechas a string para evitar errores de hidratación de Next.js
  const rendiciones = rendicionesRaw.map(r => ({
    ...r,
    fecha: r.fecha.toISOString()
  }));

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
       <RecaudacionesDashboard initialData={rendiciones as any} cobradores={cobradores} />
    </div>
  );
}

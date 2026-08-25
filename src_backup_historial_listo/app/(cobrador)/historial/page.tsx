import { prisma } from "@/lib/prisma";
import HistorialFeed from "./HistorialFeed";

export default async function HistorialPage() {
  const cobrador = await prisma.usuario.findFirst({
    where: { rol: "COBRADOR" }
  });

  if (!cobrador) return (
    <div className="p-4 bg-red-100 text-red-600 rounded-xl">
      Error: No hay ningún usuario COBRADOR
    </div>
  );

  const prestamos = await prisma.prestamo.findMany({
    where: { cobrador_id: cobrador.id },
    include: { cliente: true },
    orderBy: { fecha_creacion: "desc" }
  });

  return (
    <div className="animate-in fade-in zoom-in-95 duration-300">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Historial</h2>
        <p className="text-slate-500 text-sm mt-0.5">Préstamos emitidos recientemente</p>
      </div>

      <HistorialFeed initialPrestamos={prestamos} />
    </div>
  );
}

import { getCobrosHoy } from "@/actions/rutas";
import { prisma } from "@/lib/prisma";
import MisRutasList from "./MisRutasList";

export default async function MisRutasPage() {
  const cobrador = await prisma.usuario.findFirst({
    where: { rol: "COBRADOR" }
  });

  if (!cobrador) {
    return (
      <div className="p-4 bg-red-100 text-red-600 rounded-xl">
        Error: No hay ningún usuario COBRADOR en la base de datos.
      </div>
    );
  }

  const cuotas = await getCobrosHoy(cobrador.id);

  return (
    <div className="animate-in fade-in zoom-in-95 duration-300">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Hoja de Ruta</h2>
        <p className="text-slate-500 text-sm mt-0.5">Cobros programados para hoy</p>
      </div>

      <MisRutasList initialCuotas={cuotas} />
    </div>
  );
}

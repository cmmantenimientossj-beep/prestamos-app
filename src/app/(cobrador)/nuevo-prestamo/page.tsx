import { prisma } from "@/lib/prisma";
import NuevoPrestamoForm from "./NuevoPrestamoForm";

export default async function NuevoPrestamoPage() {
  // Fetch available clients
  const clientes = await prisma.cliente.findMany({
    select: { id: true, nombre_apellido: true },
    orderBy: { nombre_apellido: 'asc' }
  });

  // Temporarily grab a cobrador so FK doesn't fail.
  // In production, this comes from getServerSession(authOptions)
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

  return (
    <div className="animate-in fade-in zoom-in-95 duration-300">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Nuevo Crédito</h2>
        <p className="text-slate-500 text-sm mt-0.5">Otorgar préstamo rápido en calle</p>
      </div>

      <NuevoPrestamoForm clientes={clientes} cobradorId={cobrador.id} />
    </div>
  );
}

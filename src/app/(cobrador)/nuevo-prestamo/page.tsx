import { prisma } from "@/lib/prisma";
import NuevoPrestamoForm from "./NuevoPrestamoForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function NuevoPrestamoPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || !session.user.id) {
    return (
      <div className="p-4 bg-red-100 text-red-600 rounded-xl font-bold">
        Error: Sesión no encontrada o expirada. Por favor inicie sesión nuevamente.
      </div>
    );
  }

  // Fetch available clients
  const clientes = await prisma.cliente.findMany({
    select: { id: true, nombre_apellido: true, direccion_negocio: true, direccion_personal: true },
    orderBy: { nombre_apellido: 'asc' }
  });

  return (
    <div className="animate-in fade-in zoom-in-95 duration-300">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Solicitar Préstamo</h2>
        <p className="text-slate-500 text-sm mt-0.5">Enviar una solicitud de crédito al administrador</p>
      </div>

      <NuevoPrestamoForm 
        clientes={clientes} 
        cobradorId={session.user.id} 
        cobradorNombre={session.user.name || "Cobrador"} 
      />
    </div>
  );
}

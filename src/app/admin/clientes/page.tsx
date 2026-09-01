import { prisma } from "@/lib/prisma";
import ClientManager from "./ClientManager";

export default async function ClientesPage() {
  const clientes = await prisma.cliente.findMany({
    include: {
      _count: {
        select: {
          prestamos: true // This gets the total count of all loans
        }
      },
      // We also need to get loans specifically to check for active/mora and count them easily. Let's select all 'ACTIVO' or 'MORA' loans
      prestamos: {
        where: { estado: { in: ['ACTIVO', 'MORA'] } },
        select: { estado: true }
      }
    },
    orderBy: { nombre_apellido: 'asc' }
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
       <ClientManager initialClientes={clientes} />
    </div>
  );
}

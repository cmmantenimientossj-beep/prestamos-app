import { prisma } from "@/lib/prisma";
import ClientManager from "./ClientManager";

export default async function ClientesPage() {
  const clientes = await prisma.cliente.findMany({
    include: {
      _count: {
        select: {
          prestamos: { where: { estado: 'ACTIVO' } }
        }
      },
      // Hack to see if they have any active Mora quickly
      prestamos: {
        where: { estado: 'MORA' },
        take: 1
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

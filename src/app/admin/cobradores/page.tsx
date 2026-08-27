import { prisma } from "@/lib/prisma";
import CobradorManager from "./CobradorManager";

export default async function CobradoresPage() {
  const cobradores = await prisma.usuario.findMany({
    where: { rol: "COBRADOR" },
    include: {
      _count: {
        select: {
          clientesAsignados: true,
          prestamos: true,
        }
      }
    },
    orderBy: { nombre: 'asc' }
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
       <CobradorManager initialCobradores={cobradores} />
    </div>
  );
}

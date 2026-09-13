import { prisma } from "@/lib/prisma";
import ComisionesClient from "./ComisionesClient";
import { Wallet } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ComisionesPage() {
  const gastos = await prisma.gasto.findMany({
    orderBy: { fecha: 'desc' }
  });

  const comisiones = gastos.filter(g => g.motivo.startsWith("Comisión para: "));

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="mb-6 flex flex-col items-start gap-4">
        <Link href="/admin/resumen" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-semibold text-sm">
           <ArrowLeft size={16} /> Volver al balance
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
             <div className="p-2.5 bg-blue-100 text-blue-600 rounded-2xl"><Wallet size={24} /></div>
             Gestor de Comisiones
          </h1>
          <p className="text-slate-500 mt-2">Registra y controla las comisiones entregadas. Todo lo registrado aquí descontará automáticamente de las ganancias históricas de la empresa.</p>
        </div>
      </div>
      
      <ComisionesClient data={comisiones} />
    </div>
  );
}

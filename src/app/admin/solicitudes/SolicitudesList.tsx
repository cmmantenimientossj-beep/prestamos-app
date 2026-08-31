"use client";

import Link from "next/link";
import { ClipboardList } from "lucide-react";

export default function SolicitudesList({ solicitudes }: { solicitudes: any[] }) {

  if (solicitudes.length === 0) {
     return (
        <div className="bg-white p-8 rounded-3xl text-center border border-slate-200 shadow-sm">
          <ClipboardList size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-700">No hay solicitudes pendientes</h3>
          <p className="text-slate-500">Al momento no tienes solicitudes en espera de aprobación.</p>
        </div>
     );
  }

  const formatCurrency = (n: number) => {
    return Math.floor(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  return (
    <div className="space-y-3 pb-8">
       {solicitudes.map(s => {
          const nombreMostrar = s.cliente ? s.cliente.nombre_apellido : (s.nuevo_cliente_nombre_apellido || "Cliente Nuevo");
          return (
             <Link 
               key={s.id}
               href={`/admin/solicitudes/${s.id}`}
               className="w-full bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center hover:bg-slate-50 transition-colors active:scale-[0.98] text-left"
             >
                <div>
                   <h3 className="font-bold text-slate-800 text-[15px] uppercase flex items-center gap-2 line-clamp-1">
                      {nombreMostrar}
                      {!s.cliente_id && <span className="bg-blue-100 text-blue-600 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest whitespace-nowrap">NUEVO</span>}
                   </h3>
                   <p className="text-xs text-slate-500 mt-1 font-semibold flex items-center gap-1 line-clamp-1">
                     Cobrador: <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 truncate max-w-[120px]">{s.cobrador?.nombre || "N/A"}</span>
                   </p>
                </div>
                <div className="text-right shrink-0 ml-2">
                   <p className="font-black text-emerald-700 text-sm" suppressHydrationWarning>${formatCurrency(s.monto_solicitado)}</p>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-0.5">{s.cantidad_cuotas} cuotas</p>
                </div>
             </Link>
          )
       })}
    </div>
  )
}

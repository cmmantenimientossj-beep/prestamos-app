"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Clock, CheckCircle, AlertTriangle } from "lucide-react";

export default function ClientProfileTabs({ prestamos }: { prestamos: any[] }) {
  const [tab, setTab] = useState<"ACTIVOS" | "ARCHIVADOS">("ACTIVOS");

  const activos = prestamos.filter(p => p.estado !== 'PAGADO');
  const archivados = prestamos.filter(p => p.estado === 'PAGADO');

  const list = tab === "ACTIVOS" ? activos : archivados;

  return (
    <div>
       <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-6 shadow-inner w-full sm:max-w-md">
         <button 
           onClick={() => setTab("ACTIVOS")}
           className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${tab === 'ACTIVOS' ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}
         >
           Activos ({activos.length})
         </button>
         <button 
           onClick={() => setTab("ARCHIVADOS")}
           className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${tab === 'ARCHIVADOS' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
         >
           Finalizados ({archivados.length})
         </button>
       </div>

       <div className="space-y-4">
         {list.length === 0 ? (
           <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 shadow-sm animate-in fade-in">
             No se encontraron préstamos {tab === 'ACTIVOS' ? 'activos' : 'archivados'} para este cliente.
           </div>
         ) : (
           list.map((prestamo) => {
             const prestamoMora = prestamo.cuotas.some((c: any) => c.estado === 'PENDIENTE' && new Date(c.fecha_vencimiento) < new Date());
             const prestamoAlDia = prestamo.estado === 'ACTIVO' && !prestamoMora;
             const prestamoPagado = prestamo.estado === 'PAGADO';

             let tagColor = 'bg-slate-100 text-slate-600 border-slate-200';
             if (prestamoPagado) tagColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
             else if (prestamoMora) tagColor = 'bg-red-50 text-red-700 border-red-200 animate-pulse';
             else if (prestamoAlDia) tagColor = 'bg-blue-50 text-blue-700 border-blue-200';

             return (
               <div key={prestamo.id} className="bg-white border border-slate-200 rounded-2xl p-1 shadow-sm overflow-hidden animate-in slide-in-from-bottom-2 duration-300">
                 {/* Header Prestamo */}
                 <div className="bg-slate-50 p-4 rounded-xl flex flex-wrap justify-between items-center gap-4">
                   <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">PRESTAMO REF: {prestamo.codigo}</p>
                     <p className="text-xl font-black text-slate-800">${prestamo.monto_solicitado.toLocaleString('es-AR')}</p>
                     <p className="text-xs font-semibold text-slate-500 mt-1">
                       Otorgado: {format(new Date(prestamo.fecha_entrega), "d 'de' MMMM, yyyy", { locale: es })}
                     </p>
                   </div>
                   
                   <div className="text-right">
                     <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${tagColor} inline-block mb-2 shadow-sm`}>
                       {prestamoPagado ? 'Cancelado / Archivado' : prestamoMora ? 'En Mora / Atrasado' : 'Activo / Al Día'}
                     </span>
                     <p className="text-sm font-semibold text-slate-600">
                       <span className="font-bold text-slate-800">{prestamo.cantidad_cuotas}</span> cuotas de <span className="font-bold text-slate-800">${prestamo.valor_cuota.toLocaleString('es-AR')}</span>
                     </p>
                   </div>
                 </div>

                 {/* Timeline Simplificado */}
                 <div className="p-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                   {prestamo.cuotas.map((cuota: any) => {
                     let cColor = 'bg-slate-100 border-slate-200 text-slate-400';
                     let cIcon = <Clock size={14} className="opacity-50" />;
                     
                     if (cuota.estado === 'PAGADO') {
                       cColor = 'bg-emerald-50 border-emerald-200 text-emerald-600 shadow-sm';
                       cIcon = <CheckCircle size={14} />;
                     } else if (new Date(cuota.fecha_vencimiento) < new Date()) {
                       cColor = 'bg-red-50 border-red-200 text-red-600 shadow-[0_0_8px_rgba(239,68,68,0.2)]';
                       cIcon = <AlertTriangle size={14} />;
                     }

                     return (
                       <div key={cuota.id} className={`border rounded-xl p-2 flex flex-col items-center justify-center text-center transition-all ${cColor}`}>
                         <span className="text-[10px] font-black mb-1 opacity-90">C-{cuota.numero_cuota}</span>
                         {cIcon}
                         <span className="text-[9px] mt-1.5 font-bold tracking-wider">{format(new Date(cuota.fecha_vencimiento), "dd/MM")}</span>
                       </div>
                     )
                   })}
                 </div>
               </div>
             );
           })
         )}
       </div>
    </div>
  )
}

"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Clock, CheckCircle, AlertTriangle, Edit2, X, Save } from "lucide-react";
import { updatePrestamoDates } from "@/actions/prestamos";

export default function ClientProfileTabs({ prestamos }: { prestamos: any[] }) {
  const [tab, setTab] = useState<"ACTIVOS" | "ARCHIVADOS">("ACTIVOS");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFechaEntrega, setEditFechaEntrega] = useState("");
  const [editFechaCobro, setEditFechaCobro] = useState("");
  const [isPending, startTransition] = useTransition();

  const activos = prestamos.filter(p => p.estado !== 'PAGADO');
  const archivados = prestamos.filter(p => p.estado === 'PAGADO');

  const handleEditClick = (p: any) => {
    setEditingId(p.id);
    setEditFechaEntrega(new Date(p.fecha_entrega).toISOString().split('T')[0]);
    // Asumimos que la primera cuota nos da una idea del primer cobro si es que fecha_primer_cobro no está directamente disponible, 
    // pero sí lo está (es un campo escalar Prisma). Lo casteamos por seguridad de timezone.
    setEditFechaCobro(new Date(p.fecha_primer_cobro || p.cuotas[0]?.fecha_vencimiento).toISOString().split('T')[0]);
  };

  const handleSave = (pId: string) => {
    if (!editFechaEntrega || !editFechaCobro) return;
    startTransition(async () => {
      // Usamos T12:00:00 para evitar problemas de Timezone shift
      await updatePrestamoDates(
        pId, 
        new Date(editFechaEntrega + "T12:00:00"), 
        new Date(editFechaCobro + "T12:00:00")
      );
      setEditingId(null);
    });
  };

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
                   <div className="flex-1">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">PRESTAMO REF: {prestamo.codigo}</p>
                     <p className="text-xl font-black text-slate-800">${prestamo.monto_solicitado.toLocaleString('es-AR')}</p>
                     
                     {editingId === prestamo.id ? (
                       <div className="flex flex-col gap-2 mt-3 p-3 bg-white border border-emerald-100 rounded-xl shadow-sm animate-in fade-in zoom-in-95">
                         <label className="text-[11px] font-bold text-slate-500 uppercase">Nueva Fecha Entrega</label>
                         <input 
                           type="date"
                           value={editFechaEntrega}
                           onChange={e => setEditFechaEntrega(e.target.value)}
                           className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-sm font-bold text-slate-700" 
                         />
                         <label className="text-[11px] font-bold text-slate-500 uppercase mt-1">Nueva Fecha 1° Cobro (Inicio)</label>
                         <input 
                           type="date"
                           value={editFechaCobro}
                           onChange={e => setEditFechaCobro(e.target.value)}
                           className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-sm font-bold text-slate-700" 
                         />
                         <div className="flex gap-2 mt-2">
                            <button onClick={() => setEditingId(null)} disabled={isPending} className="flex-1 bg-slate-100 text-slate-600 font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-1"><X size={14}/> Cancelar</button>
                            <button onClick={() => handleSave(prestamo.id)} disabled={isPending} className="flex-1 bg-emerald-500 text-white font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-1"><Save size={14}/> {isPending ? 'Guardando...' : 'Guardar'}</button>
                         </div>
                       </div>
                     ) : (
                       <div className="flex items-center gap-2 mt-1 group">
                         <p className="text-xs font-semibold text-slate-500">
                           Otorgado: {format(new Date(prestamo.fecha_entrega), "d 'de' MMMM, yyyy", { locale: es })}
                         </p>
                         {(prestamoAlDia || prestamoMora) && (
                           <button 
                             onClick={() => handleEditClick(prestamo)}
                             title="Corregir fechas por error" 
                             className="text-slate-300 hover:text-emerald-600 bg-slate-100 hover:bg-emerald-50 p-1 rounded transition-colors"
                           >
                             <Edit2 size={12} />
                           </button>
                         )}
                       </div>
                     )}
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

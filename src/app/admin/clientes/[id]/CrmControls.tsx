"use client";

import { useState, useTransition } from "react";
import { updateClienteCrm } from "@/actions/clientes";
import { AlertCircle, FileEdit, ShieldAlert, Check } from "lucide-react";

interface CrmControlsProps {
   clienteId: string;
   initialNotas: string | null;
   initialCalificacion: string;
}

export default function CrmControls({ clienteId, initialNotas, initialCalificacion }: CrmControlsProps) {
    const [isPending, startTransition] = useTransition();
    const [notas, setNotas] = useState(initialNotas || "");
    const [calificacion, setCalificacion] = useState(initialCalificacion);
    const [isDraft, setIsDraft] = useState(false);
    
    const handleSave = () => {
       startTransition(async () => {
          const res = await updateClienteCrm(clienteId, notas, calificacion);
          if (res.success) {
            setIsDraft(false);
          } else {
            alert(res.error);
          }
       });
    };

    const hasChanges = (notas !== (initialNotas || "")) || calificacion !== initialCalificacion;
    const isSaveable = hasChanges || isDraft;

    return (
       <div className="bg-slate-900 border border-slate-700/50 rounded-[2rem] p-6 shadow-xl relative overflow-hidden">
         <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5"><ShieldAlert size={14}/> Módulo CRM Avanzado</h3>
         
         <div className="space-y-5 relative z-10">
           {/* Selector de Riesgo */}
           <div>
             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Nivel de Riesgo Operativo</label>
             <div className="grid grid-cols-2 gap-2">
                 {['NEUTRAL', 'BUENO', 'MALO', 'LISTA_NEGRA'].map(cal => (
                    <button 
                       key={cal}
                       type="button"
                       onClick={() => { setCalificacion(cal); setIsDraft(true); }}
                       className={`p-2 rounded-xl text-xs font-bold uppercase transition-colors outline-none border ${calificacion === cal 
                          ? (cal === 'LISTA_NEGRA' ? 'bg-red-900/50 text-red-100 border-red-500' 
                             : cal === 'MALO' ? 'bg-orange-900/50 text-orange-200 border-orange-500'
                             : cal === 'BUENO' ? 'bg-emerald-900/50 text-emerald-200 border-emerald-500'
                             : 'bg-slate-700 text-white border-slate-500')
                          : 'bg-transparent text-slate-500 border-slate-700/50 hover:bg-slate-800'}`}
                    >
                       {cal.replace('_', ' ')}
                    </button>
                 ))}
             </div>
           </div>

           {/* Notas Internas */}
           <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block flex items-center justify-between">
                Notas Administrativas (Solo lectura local y Cobradores)
              </label>
              <div className="relative">
                 <FileEdit className="absolute top-3 left-3 text-slate-500" size={16} />
                 <textarea 
                    rows={4}
                    value={notas}
                    onChange={(e) => { setNotas(e.target.value); setIsDraft(true); }}
                    placeholder="Ej. Excelente pagador, autorizar hasta $50.000, solicitar garantía extra..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl text-sm p-3 pl-10 text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-shadow resize-none"
                 />
              </div>
           </div>

           {/* Call to action (Aparece si hay cambios) */}
           <div className={`transition-all duration-300 ${isSaveable ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0 overflow-hidden'}`}>
             <button 
                onClick={handleSave}
                disabled={isPending}
                className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-black uppercase tracking-widest text-xs p-3 transition-colors flex justify-center items-center gap-2 disabled:bg-emerald-800"
             >
                {isPending ? 'Actualizando...' : <><Check size={16} /> Guardar Cambios</>}
             </button>
           </div>

         </div>

       </div>
    );
}

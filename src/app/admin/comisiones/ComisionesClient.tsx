"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { addComision, deleteComision } from "@/actions/comisiones";

export default function ComisionesClient({ data }: { data: any[] }) {
  const [nombre, setNombre] = useState("");
  const [monto, setMonto] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !monto || isNaN(Number(monto))) return;

    startTransition(async () => {
      const res = await addComision(nombre, Number(monto));
      if (res.success) {
        setNombre("");
        setMonto("");
      } else {
        alert(res.error);
      }
    });
  };

  const handleDelete = (id: string) => {
    if(!window.confirm("¿Estás seguro de que deseas anular esta comisión registrada? La ganancia histórica volverá a subir.")) return;
    startTransition(async () => {
      const res = await deleteComision(id);
      if (!res.success) alert(res.error);
    });
  };

  const totalComisiones = data.reduce((acc, curr) => acc + curr.monto, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* Formulario */}
      <div className="md:col-span-1">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 sticky top-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Plus className="text-blue-500" size={18} /> Registrar
          </h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nombre del Beneficiario</label>
              <input 
                required 
                type="text" 
                value={nombre} 
                onChange={e => setNombre(e.target.value)} 
                className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500" 
                placeholder="Ej. Juan Pérez"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Monto ($)</label>
              <input 
                required 
                type="number" 
                min="0"
                step="1"
                value={monto} 
                onChange={e => setMonto(e.target.value)} 
                className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500" 
                placeholder="Ej. 15000"
              />
            </div>
            <button 
              disabled={isPending} 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl disabled:opacity-50 transition-colors shadow-md shadow-blue-500/20"
            >
              {isPending ? 'Procesando...' : 'Guardar Comisión'}
            </button>
          </form>
        </div>
      </div>

      {/* Listado de Comisiones */}
      <div className="md:col-span-2 space-y-4">
        
        {/* Metric total */}
        <div className="bg-gradient-to-r from-slate-900 to-blue-900 rounded-3xl p-6 shadow-xl text-white flex justify-between items-center">
            <div>
                <span className="text-blue-300 text-xs font-bold uppercase tracking-wider block mb-1">Monto Total Descontado</span>
                <span className="text-4xl font-black">${totalComisiones.toLocaleString('es-AR')}</span>
            </div>
        </div>

        {/* List */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200">
           <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
               <h3 className="font-bold text-slate-700">Historial Detallado</h3>
               <span className="text-xs font-bold text-slate-400 bg-white px-2 py-1 rounded-md border border-slate-200">{data.length} reg.</span>
           </div>
           <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
             {data.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">
                  Aún no has registrado ninguna comisión.
                </div>
             ) : (
                data.map(com => (
                  <div key={com.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                     <div>
                       <p className="font-bold text-slate-800">{com.motivo.replace('Comisión para: ', '')}</p>
                       <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                          <CalendarDays size={12} /> {format(new Date(com.fecha), 'd MMM yyyy - HH:mm', { locale: es })}
                       </p>
                     </div>
                     <div className="flex items-center gap-4">
                        <span className="font-black text-red-500 bg-red-50 px-3 py-1 rounded-lg">-${com.monto.toLocaleString('es-AR')}</span>
                        <button 
                           onClick={() => handleDelete(com.id)}
                           disabled={isPending}
                           className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-white rounded-full shadow-sm border border-slate-200 hover:border-red-200"
                           title="Anular Comisión"
                        >
                           <Trash2 size={16} />
                        </button>
                     </div>
                  </div>
                ))
             )}
           </div>
        </div>
      </div>

    </div>
  );
}

"use client";

import { useState } from "react";
import { X, MinusCircle, CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function GastosClientModal({ gastos }: { gastos: any[] }) {
  const [isOpen, setIsOpen] = useState(false);

  const total = gastos.reduce((acc, g) => acc + g.monto, 0);

  return (
    <>
      <div 
        onClick={() => setIsOpen(true)}
        className="p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20 hover:bg-rose-500/20 cursor-pointer transition-colors group"
      >
         <span className="text-rose-400 text-[10px] font-bold uppercase tracking-widest mb-1 flex justify-between items-center">
            Gastos & Retiros
            <MinusCircle size={12} className="group-hover:translate-x-1 transition-transform" />
         </span>
         <span className="text-xl font-bold block text-white">-${total.toLocaleString('es-AR', {maximumFractionDigits: 0})}</span>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in text-slate-800">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative max-h-[85vh] flex flex-col">
            <button 
              onClick={() => setIsOpen(false)} 
              className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full p-1.5 transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <MinusCircle className="text-rose-500" />
                Historial de Gastos
              </h2>
              <p className="text-sm text-slate-500 mt-1">Egresos operativos, retiros y misceláneos (Excluye comisiones)</p>
            </div>

            <div className="overflow-y-auto flex-1 pr-2 space-y-2">
              {gastos.map((g, i) => (
                <div key={i} className="flex justify-between items-center p-3 hover:bg-slate-50 border border-slate-100 rounded-xl transition-colors">
                  <div>
                    <span className="font-semibold text-sm text-slate-700 block truncate">{g.motivo}</span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5"><CalendarDays size={10}/> {format(new Date(g.fecha), 'dd MMM yyyy', { locale: es })}</span>
                  </div>
                  <span className="font-black text-rose-600 bg-rose-50 px-2 py-1 rounded-md text-sm">
                    -${g.monto.toLocaleString('es-AR', {maximumFractionDigits: 0})}
                  </span>
                </div>
              ))}
              {gastos.length === 0 && (
                <p className="text-slate-400 text-center py-8 text-sm">No hay gastos operativos registrados.</p>
              )}
            </div>
            
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useState } from "react";
import { X, TrendingUp } from "lucide-react";

export function GananciasClientModal({
  gananciasPrincipales,
  clientesGanancias
}: {
  gananciasPrincipales: number;
  clientesGanancias: { nombre: string; ganancia: number }[];
}) {
  const [isOpen, setIsOpen] = useState(false);

  // Ordenar lista de mayor a menor ganancia
  const listaOrdenada = [...clientesGanancias].sort((a, b) => b.ganancia - a.ganancia);

  return (
    <>
      <div 
        onClick={() => setIsOpen(true)}
        className="p-4 bg-white/5 rounded-2xl border border-emerald-500/20 hover:bg-white/10 cursor-pointer transition-colors group"
      >
         <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-1 flex justify-between items-center">
            Ganancias Brutas
            <TrendingUp size={12} className="group-hover:translate-x-1 transition-transform" />
         </span>
         <span className="text-xl font-bold block text-white">${gananciasPrincipales.toLocaleString('es-AR', {maximumFractionDigits: 0})}</span>
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
                <TrendingUp className="text-emerald-500" />
                Historial de Rentabilidad
              </h2>
              <p className="text-sm text-slate-500 mt-1">Beneficios brutos generados por cada cliente (Devengo)</p>
            </div>

            <div className="overflow-y-auto flex-1 pr-2 space-y-2">
              {listaOrdenada.map((c, i) => (
                <div key={i} className="flex justify-between items-center p-3 hover:bg-slate-50 border border-slate-100 rounded-xl transition-colors">
                  <span className="font-semibold text-sm text-slate-700 truncate mr-4">{c.nombre}</span>
                  <span className="font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-sm">
                    ${c.ganancia.toLocaleString('es-AR', {maximumFractionDigits: 0})}
                  </span>
                </div>
              ))}
              {listaOrdenada.length === 0 && (
                <p className="text-slate-400 text-center py-8 text-sm">No hay ganancias registradas aún.</p>
              )}
            </div>
            
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useState } from "react";
import { Calculator, X } from "lucide-react";

export default function LoanSimulator() {
  const [isOpen, setIsOpen] = useState(false);
  const [monto, setMonto] = useState<number>(10000);
  const [interes, setInteres] = useState<number>(20);
  const [cuotas, setCuotas] = useState<number>(24);
  const [modalidad, setModalidad] = useState("DIARIO");

  const totalDevolver = (monto || 0) + ((monto || 0) * (interes || 0) / 100);
  const valorCuota = cuotas > 0 ? totalDevolver / cuotas : 0;

  return (
    <>
      <button 
        onClick={(e) => { e.preventDefault(); setIsOpen(true); }}
        className="flex flex-col items-center px-4 py-2 transition-colors text-slate-400 hover:text-emerald-500"
      >
        <Calculator size={24} />
        <span className="text-[10px] uppercase font-bold tracking-wider mt-1.5 opacity-90">Simular</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center bg-slate-900/40 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-t-[2rem] sm:rounded-2xl p-6 shadow-2xl relative animate-in slide-in-from-bottom-8 duration-300">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
              <Calculator className="text-emerald-500" /> Simulador
            </h2>
            
            <div className="space-y-4">
               <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Monto a Prestar</label>
                  <input type="number" 
                    value={monto || ''} 
                    onChange={e => setMonto(parseFloat(e.target.value))} 
                    className="w-full text-lg font-bold p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Interés (%)</label>
                    <input type="number" 
                      value={interes || ''} 
                      onChange={e => setInteres(parseFloat(e.target.value))} 
                      className="w-full text-lg p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                 </div>
                 <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Cuotas</label>
                    <input type="number" 
                      value={cuotas || ''} 
                      onChange={e => setCuotas(parseInt(e.target.value))} 
                      className="w-full text-lg p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                 </div>
               </div>
               
               <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Modalidad</label>
                  <select 
                    value={modalidad} 
                    onChange={e => setModalidad(e.target.value)} 
                    className="w-full text-lg p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <option value="DIARIO">Diario</option>
                    <option value="SEMANAL">Semanal</option>
                    <option value="QUINCENAL">Quincenal</option>
                    <option value="MENSUAL">Mensual</option>
                  </select>
               </div>
            </div>

            <div className="mt-8 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
               <div className="flex justify-between items-center mb-2">
                 <span className="text-sm font-bold text-emerald-800">Total a devolver:</span>
                 <span className="text-xl font-black text-emerald-600">${totalDevolver.toLocaleString('es-AR', { minimumFractionDigits:2, maximumFractionDigits:2 })}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-sm font-bold text-slate-600">Valor Cuota ({modalidad.toLowerCase()}):</span>
                 <span className="text-lg font-black text-slate-800">${valorCuota.toLocaleString('es-AR', { minimumFractionDigits:2, maximumFractionDigits:2 })}</span>
               </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

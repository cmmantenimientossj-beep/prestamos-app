"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setCapitalInvertido, addGasto } from "@/actions/admin";
import { Wallet, MinusCircle } from "lucide-react";

export function FinanzasEditors({ currentCapital }: { currentCapital: number }) {
  const router = useRouter();
  
  const [isCapitalOpen, setIsCapitalOpen] = useState(false);
  const [capitalValue, setCapitalValue] = useState(currentCapital.toString());
  const [isCapitalSaving, setIsCapitalSaving] = useState(false);

  const [isGastoOpen, setIsGastoOpen] = useState(false);
  const [gastoMotivo, setGastoMotivo] = useState("");
  const [gastoMonto, setGastoMonto] = useState("");
  const [isGastoSaving, setIsGastoSaving] = useState(false);

  const handleSaveCapital = async () => {
    setIsCapitalSaving(true);
    await setCapitalInvertido(parseFloat(capitalValue) || 0);
    setIsCapitalSaving(false);
    setIsCapitalOpen(false);
    router.refresh();
  };

  const handleSaveGasto = async () => {
    if (!gastoMotivo || !gastoMonto) return;
    setIsGastoSaving(true);
    await addGasto(gastoMotivo, parseFloat(gastoMonto));
    setIsGastoSaving(false);
    setIsGastoOpen(false);
    setGastoMotivo("");
    setGastoMonto("");
    router.refresh();
  };

  return (
    <div className="flex flex-wrap gap-4 mb-6">
      {/* Botón y Modal Capital */}
      <div>
        <button 
          onClick={() => setIsCapitalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
        >
          <Wallet size={18} /> Ajustar Capital Invertido
        </button>

        {isCapitalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
              <h3 className="text-xl font-bold text-slate-800 mb-2">Capital Inicial / Invertido</h3>
              <p className="text-slate-500 text-sm mb-4">Ingresa el fondo de dinero total que has puesto en la empresa.</p>
              
              <input 
                type="number" 
                value={capitalValue}
                onChange={e => setCapitalValue(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 mb-6 font-medium text-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ej. 5000000"
              />
              
              <div className="flex justify-end gap-3">
                <button onClick={() => setIsCapitalOpen(false)} className="px-5 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium">Cancelar</button>
                <button onClick={handleSaveCapital} disabled={isCapitalSaving} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-md shadow-blue-500/20">
                  {isCapitalSaving ? "Guardando..." : "Guardar Capital"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Botón y Modal Gasto */}
      <div>
        <button 
          onClick={() => setIsGastoOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-medium transition-colors"
        >
          <MinusCircle size={18} /> Registrar Gasto / Retiro
        </button>

        {isGastoOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
              <h3 className="text-xl font-bold text-slate-800 mb-2">Registrar Gasto o Egreso</h3>
              <p className="text-slate-500 text-sm mb-4">Registra extracciones, pagos de comisiones o gastos para descontarlos de caja real.</p>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-1 block">Motivo</label>
                  <input 
                    type="text" 
                    value={gastoMotivo}
                    onChange={e => setGastoMotivo(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-rose-500 outline-none"
                    placeholder="Ej. Pago de comisiones, Alquiler..."
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-1 block">Monto ($)</label>
                  <input 
                    type="number" 
                    value={gastoMonto}
                    onChange={e => setGastoMonto(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 font-medium text-lg focus:ring-2 focus:ring-rose-500 outline-none"
                    placeholder="Ej. 15000"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <button onClick={() => setIsGastoOpen(false)} className="px-5 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium">Cancelar</button>
                <button onClick={handleSaveGasto} disabled={isGastoSaving} className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-medium shadow-md shadow-rose-500/20">
                  {isGastoSaving ? "Guardando..." : "Descontar de Caja"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { Search, MapPin, Phone, MessageCircle, ChevronRight, Filter } from "lucide-react";
import { cobrarCuota } from "@/actions/rutas";

export default function MisRutasList({ initialCuotas }: { initialCuotas: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleCobrar = async (cuotaId: string, valorPendiente: number) => {
    // En una app real, aquí abriríamos un modal para preguntar "cuánto" pagó
    // Por simplicidad en esta demo, asumimos que pagó la cuota completa.
    const confirm = window.confirm(`¿Confirmar cobro de $${valorPendiente}?`);
    if (!confirm) return;

    setProcessingId(cuotaId);
    startTransition(async () => {
      const res = await cobrarCuota(cuotaId, valorPendiente);
      if (res.success) {
        // En Next.js App Router el revalidatePath actualizará la UI automáticamente
        alert("Cobro registrado exitosamente");
      } else {
        alert(res.error || "Error al cobrar");
      }
      setProcessingId(null);
    });
  };

  return (
    <>
      <div className="flex gap-2 mb-6">
        <button className="flex-1 bg-emerald-600 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-emerald-600/30">Hoy</button>
        <button className="flex-1 bg-slate-200 text-slate-600 font-bold py-2.5 rounded-xl">Mañana</button>
        <button className="flex-1 bg-slate-200 text-slate-600 font-bold py-2.5 rounded-xl">Atrasados</button>
      </div>

      <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 mb-6 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar zona o cliente..." 
            className="w-full bg-slate-50 border-none rounded-xl pl-10 pr-4 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>
        <button className="bg-slate-50 p-2.5 rounded-xl text-slate-500">
          <Filter size={20} />
        </button>
      </div>

      <div className="space-y-4">
        {initialCuotas.length === 0 ? (
          <div className="text-center p-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <h3 className="font-bold text-slate-500">Todo limpio</h3>
            <p className="text-sm text-slate-400">No hay cuotas pendientes para hoy.</p>
          </div>
        ) : (
          initialCuotas.map(cuota => {
            const cliente = cuota.prestamo.cliente;
            const aCobrar = cuota.valor - cuota.monto_pagado;

            return (
              <div key={cuota.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 relative overflow-hidden active:scale-[0.98] transition-transform">
                <div className="absolute left-0 top-0 w-1.5 h-full bg-emerald-500 rounded-l-2xl"></div>
                
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg">{cliente.nombre_apellido}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin size={12} /> {cliente.direccion_negocio || cliente.direccion_personal || "Sin dirección"}
                    </p>
                  </div>
                  <span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-lg text-xs font-black">
                    CUOTA {cuota.numero_cuota}/{cuota.prestamo.cantidad_cuotas}
                  </span>
                </div>

                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl mb-4">
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wide">
                    {cuota.estado === "PARCIAL" ? "Restante a Cobrar" : "A cobrar"}
                  </p>
                  <p className="text-xl font-black text-emerald-600">${aCobrar.toLocaleString()}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    disabled={isPending && processingId === cuota.id}
                    onClick={() => handleCobrar(cuota.id, aCobrar)}
                    className="flex-1 disabled:opacity-50 disabled:bg-slate-400 bg-emerald-600 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-emerald-500/30 flex justify-center items-center gap-2"
                  >
                    {isPending && processingId === cuota.id ? "Guardando..." : (
                      <>Cobrar <ChevronRight size={16} strokeWidth={3} /></>
                    )}
                  </button>
                  <button className="bg-slate-100 text-slate-600 p-2.5 rounded-xl">
                    <Phone size={20} />
                  </button>
                  <button className="bg-emerald-50 text-emerald-600 p-2.5 rounded-xl">
                    <MessageCircle size={20} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}

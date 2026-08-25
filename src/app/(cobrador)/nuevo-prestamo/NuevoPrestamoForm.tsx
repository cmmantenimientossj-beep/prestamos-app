"use client";

import { useState, useMemo, useTransition } from "react";
import { UserPlus, Calculator, CalendarClock } from "lucide-react";
import { generatePaymentSchedule, ModalidadPrestamo } from "@/lib/loan-calculator";
import { createPrestamo } from "@/actions/prestamos";
import { useRouter } from "next/navigation";

interface Cliente {
  id: string;
  nombre_apellido: string;
}

interface FormProps {
  clientes: Cliente[];
  cobradorId: string;
}

export default function NuevoPrestamoForm({ clientes, cobradorId }: FormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [clienteId, setClienteId] = useState(clientes[0]?.id || "");
  const [monto, setMonto] = useState(50000);
  const [interes, setInteres] = useState(20);
  const [cuotas, setCuotas] = useState(24);
  const [modalidad, setModalidad] = useState<ModalidadPrestamo>("DIARIA");

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const schedulePreview = useMemo(() => {
    if (monto > 0 && interes >= 0 && cuotas > 0) {
      // Inicia cobro asumiendo "mañana" (simulado rápido para preview)
      const fechaInicio = new Date();
      fechaInicio.setDate(fechaInicio.getDate() + 1);

      return generatePaymentSchedule({
        monto_solicitado: monto,
        porcentaje_interes: interes,
        cantidad_cuotas: cuotas,
        modalidad,
        fecha_inicio: fechaInicio,
      });
    }
    return null;
  }, [monto, interes, cuotas, modalidad]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteId) return;

    setErrorMsg("");
    setSuccessMsg("");

    const fechaEntrega = new Date();
    const fechaPrimerCobro = new Date();
    fechaPrimerCobro.setDate(fechaPrimerCobro.getDate() + 1);

    startTransition(async () => {
      const res = await createPrestamo({
        cliente_id: clienteId,
        cobrador_id: cobradorId,
        monto_solicitado: monto,
        porcentaje_interes: interes,
        cantidad_cuotas: cuotas,
        modalidad: modalidad,
        fecha_entrega: fechaEntrega,
        fecha_primer_cobro: fechaPrimerCobro,
      });

      if (res.success) {
        setSuccessMsg("¡Préstamo otorgado correctamente!");
        setTimeout(() => {
           router.push("/(cobrador)/resumen");
        }, 1500);
      } else {
        setErrorMsg(res.error || "Error al crear préstamo");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Client Selection */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2">
            <UserPlus size={18} className="text-emerald-500" />
            Seleccionar Cliente
          </h3>
        </div>
        
        <select 
          required
          value={clienteId}
          onChange={(e) => setClienteId(e.target.value)}
          className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 mb-3"
        >
          <option value="" disabled>Buscar cliente existente...</option>
          {clientes.map(c => (
            <option key={c.id} value={c.id}>{c.nombre_apellido}</option>
          ))}
        </select>
      </div>

      {/* Loan Conditions */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2 mb-4">
          <Calculator size={18} className="text-emerald-500" />
          Condiciones de Crédito
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Monto a Prestar ($)</label>
            <input 
              type="number" 
              required min="1"
              value={monto} onChange={e => setMonto(Number(e.target.value))}
              placeholder="Ej: 50000" 
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xl font-bold text-slate-800 mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Interés (%)</label>
              <div className="relative">
                <input 
                  type="number" 
                   required min="0"
                  value={interes} onChange={e => setInteres(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-lg font-bold text-slate-800 mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" 
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Cant. Cuotas</label>
              <input 
                type="number" 
                required min="1"
                value={cuotas} onChange={e => setCuotas(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-lg font-bold text-slate-800 mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" 
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Modalidad</label>
            <select 
              value={modalidad}
              onChange={(e) => setModalidad(e.target.value as ModalidadPrestamo)}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-700 font-bold mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="DIARIA">Diaria</option>
              <option value="SEMANAL">Semanal</option>
              <option value="QUINCENAL">Quincenal</option>
              <option value="MENSUAL">Mensual</option>
            </select>
          </div>
        </div>
      </div>

      {/* Date / Calculator Result Summary */}
      {schedulePreview && (
        <div className="bg-emerald-900 p-5 rounded-3xl text-emerald-50 relative overflow-hidden shadow-xl shadow-emerald-900/20">
          <div className="absolute right-[-20px] top-[-20px] opacity-10">
            <Calculator size={120} />
          </div>
          <h3 className="font-bold text-emerald-300 text-sm flex items-center gap-2 mb-4">
             <CalendarClock size={18} /> Resumen Generado
          </h3>
          
          <div className="flex justify-between items-end mb-4 border-b border-emerald-700/50 pb-4">
             <div>
               <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">A Devolver</p>
               <p className="text-3xl font-black text-white">${schedulePreview.montoTotalDevolver.toLocaleString()}</p>
             </div>
             <div className="text-right">
               <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Valor Cuota</p>
               <p className="text-2xl font-black text-white">${schedulePreview.valorCuota.toLocaleString()}</p>
             </div>
          </div>
          
          <p className="text-xs text-emerald-300/80 font-medium pb-2">
            El plan comenzará a cobrarse a partir de mañana, finalizando en {schedulePreview.cuotas.length} cobros.
          </p>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 text-red-600 p-3 rounded-xl border border-red-200 text-sm font-bold text-center">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl border border-emerald-200 text-sm font-bold text-center">
          {successMsg}
        </div>
      )}

      <button 
        type="submit" 
        disabled={isPending || !clienteId}
        className="w-full bg-emerald-500 disabled:opacity-50 text-white font-black text-lg py-4 rounded-2xl shadow-lg shadow-emerald-500/40 active:scale-95 transition-transform hover:bg-emerald-400"
      >
        {isPending ? "Procesando..." : "Aprobar y Emitir Crédito"}
      </button>
    </form>
  )
}

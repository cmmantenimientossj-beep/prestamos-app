"use client";

import { useState, useMemo, useTransition, useEffect } from "react";
import { UserPlus, Calculator } from "lucide-react";
import { generatePaymentSchedule, ModalidadPrestamo } from "@/lib/loan-calculator";
import { createPrestamo } from "@/actions/prestamos";
import { useRouter } from "next/navigation";
import PrestamoResumenCard from "@/components/PrestamoResumenCard";

interface Cliente {
  id: string;
  nombre_apellido: string;
  direccion_negocio: string | null;
  direccion_personal: string | null;
}

interface FormProps {
  clientes: Cliente[];
  cobradorId: string;
}

export default function NuevoPrestamoForm({ clientes, cobradorId }: FormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [clienteId, setClienteId] = useState(clientes[0]?.id || "");
  const [tipo, setTipo] = useState("NUEVO");
  const [montoStr, setMontoStr] = useState("50.000");
  const [interesStr, setInteresStr] = useState("20");
  const [cuotasStr, setCuotasStr] = useState("24");
  const [modalidad, setModalidad] = useState<ModalidadPrestamo>("DIARIA");

  const [fechaEntrega, setFechaEntrega] = useState(() => new Date().toISOString().split("T")[0]);
  const [fechaPrimerCobro, setFechaPrimerCobro] = useState("");
  const [isFechaCobroManual, setIsFechaCobroManual] = useState(false);

  useEffect(() => {
    if (!isFechaCobroManual && fechaEntrega) {
      const base = new Date(fechaEntrega + "T12:00:00");
      if (modalidad === "DIARIA") {
        base.setDate(base.getDate() + 1);
      } else if (modalidad === "SEMANAL") {
        base.setDate(base.getDate() + 7);
      } else if (modalidad === "QUINCENAL") {
        const day = base.getDate();
        if (day < 5) base.setDate(5);
        else if (day >= 5 && day < 20) base.setDate(20);
        else {
          base.setMonth(base.getMonth() + 1);
          base.setDate(5);
        }
      } else if (modalidad === "MENSUAL") {
        base.setMonth(base.getMonth() + 1);
      }
      setFechaPrimerCobro(base.toISOString().split("T")[0]);
    }
  }, [fechaEntrega, modalidad, isFechaCobroManual]);

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const parseNumber = (val: string) => Number(val.replace(/\./g, "").replace(",", ".")) || 0;

  const handleNumberChange = (val: string, setter: (v: string) => void) => {
    let cleaned = val.replace(/[^0-9,]/g, "");
    const parts = cleaned.split(",");
    if (parts.length > 2) cleaned = parts[0] + "," + parts.slice(1).join("");
    
    // Only format dot separators for integers
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    setter(parts.length > 1 ? `${integerPart},${parts[1]}` : integerPart);
  };

  const parseDateLocal = (dateStr: string) => new Date(dateStr + "T12:00:00");

  const schedulePreview = useMemo(() => {
    const monto = parseNumber(montoStr);
    const interes = parseNumber(interesStr);
    const cuotas = parseNumber(cuotasStr);

    if (monto > 0 && interes >= 0 && cuotas > 0 && fechaPrimerCobro) {
      return generatePaymentSchedule({
        monto_solicitado: monto,
        porcentaje_interes: interes,
        cantidad_cuotas: cuotas,
        modalidad,
        fecha_inicio: parseDateLocal(fechaPrimerCobro),
      });
    }
    return null;
  }, [montoStr, interesStr, cuotasStr, modalidad, fechaPrimerCobro]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteId || !fechaEntrega || !fechaPrimerCobro) return;

    setErrorMsg("");
    setSuccessMsg("");

    startTransition(async () => {
      const res = await createPrestamo({
        cliente_id: clienteId,
        cobrador_id: cobradorId,
        monto_solicitado: parseNumber(montoStr),
        porcentaje_interes: parseNumber(interesStr),
        cantidad_cuotas: Math.floor(parseNumber(cuotasStr)),
        modalidad: modalidad,
        tipo: tipo,
        fecha_entrega: parseDateLocal(fechaEntrega),
        fecha_primer_cobro: parseDateLocal(fechaPrimerCobro),
      });

      if (res.success) {
        setSuccessMsg("¡Solicitud enviada exitosamente al Admin!");
        setTimeout(() => {
           router.push("/resumen");
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
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Tipo de Préstamo</label>
            <select 
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-700 font-bold mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="NUEVO">Nuevo</option>
              <option value="PARALELO">Paralelo</option>
              <option value="RENOVACION">Renovación</option>
              <option value="REFINANCIACION">Refinanciación</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Monto a Prestar</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl">$</span>
              <input 
                type="text" 
                required
                value={montoStr} onChange={e => handleNumberChange(e.target.value, setMontoStr)}
                placeholder="Ej: 50.000,00" 
                className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-8 pr-4 py-3 text-xl font-bold text-slate-800 mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Interés</label>
              <div className="relative">
                <input 
                  type="text" 
                  required
                  value={interesStr} onChange={e => handleNumberChange(e.target.value, setInteresStr)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-lg font-bold text-slate-800 mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" 
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Cant. Cuotas</label>
              <input 
                type="text" 
                required
                value={cuotasStr} onChange={e => handleNumberChange(e.target.value, setCuotasStr)}
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Fecha Entrega</label>
              <input 
                type="date"
                required
                value={fechaEntrega}
                onChange={(e) => setFechaEntrega(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-700 font-bold mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <div>
              <label className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                <span>Primer Cobro</span>
                <button 
                  type="button" 
                  onClick={() => setIsFechaCobroManual(!isFechaCobroManual)}
                  className="text-emerald-500 hover:text-emerald-600 font-extrabold text-[10px] bg-emerald-50 px-2 py-0.5 rounded cursor-pointer"
                >
                  {isFechaCobroManual ? "AUTO" : "EDITAR"}
                </button>
              </label>
              <input 
                type="date"
                required
                disabled={!isFechaCobroManual}
                value={fechaPrimerCobro}
                onChange={(e) => setFechaPrimerCobro(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-700 font-bold mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-60"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Date / Calculator Result Summary */}
      {schedulePreview && (
        <PrestamoResumenCard 
          clienteNombre={clientes.find(c => c.id === clienteId)?.nombre_apellido || "Cliente Desconocido"}
          clienteDireccion={clientes.find(c => c.id === clienteId)?.direccion_negocio || clientes.find(c => c.id === clienteId)?.direccion_personal || "Sin dirección"}
          montoPrestado={parseNumber(montoStr)}
          montoTotalDevolver={schedulePreview.montoTotalDevolver}
          valorCuota={schedulePreview.valorCuota}
          cantidadCuotas={schedulePreview.cuotas.length}
          fechaEntrega={fechaEntrega}
          tipo={tipo}
          modalidad={modalidad}
        />
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
        {isPending ? "Procesando..." : "Solicitar Préstamo al Admin"}
      </button>
    </form>
  )
}

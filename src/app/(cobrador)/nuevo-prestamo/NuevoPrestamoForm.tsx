"use client";

import { useState, useMemo, useTransition, useEffect } from "react";
import { UserPlus, Calculator, UserCheck } from "lucide-react";
import { generatePaymentSchedule, ModalidadPrestamo } from "@/lib/loan-calculator";
import { createPrestamo } from "@/actions/prestamos";
import { useRouter } from "next/navigation";
import PrestamoResumenCard from "@/components/PrestamoResumenCard";

interface Cliente {
  id: string;
  nombre_apellido: string;
  direccion_negocio: string | null;
  direccion_personal: string | null;
  calificacion: string;
  notas_internas: string | null;
}

interface FormProps {
  clientes: Cliente[];
  cobradorId: string;
  cobradorNombre: string;
}

export default function NuevoPrestamoForm({ clientes, cobradorId, cobradorNombre }: FormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [clienteId, setClienteId] = useState("");
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoDni, setNuevoDni] = useState("");
  const [nuevoCelular, setNuevoCelular] = useState("");
  const [nuevaDireccion, setNuevaDireccion] = useState("");

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
        // Extras for New Client
        cliente_nuevo_nombre: nuevoNombre,
        cliente_nuevo_dni: nuevoDni,
        cliente_nuevo_celular: nuevoCelular,
        cliente_nuevo_direccion: nuevaDireccion
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
      
      {/* Session Context */}
      <div className="bg-emerald-50 p-4 rounded-xl shadow-sm border border-emerald-100 flex items-center justify-between">
        <div>
           <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-0.5">Operador Responsable</p>
           <p className="text-emerald-900 font-bold text-sm flex items-center gap-1.5"><UserCheck size={16}/> {cobradorNombre}</p>
        </div>
      </div>

      {/* Applicant Selection */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 animate-in fade-in">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2">
            <UserPlus size={18} className="text-blue-500" />
            Solicitante
          </h3>
        </div>
        
        <select 
          required
          value={clienteId}
          onChange={(e) => setClienteId(e.target.value)}
          className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 mb-3"
        >
          <option value="" disabled>Selecciona a quién le solicitas el crédito...</option>
          <option value="NUEVO" className="font-black text-blue-600">(+) CREAR NUEVO CLIENTE</option>
          <optgroup label="Clientes Existentes">
            {clientes.map(c => (
              <option key={c.id} value={c.id}>{c.nombre_apellido}</option>
            ))}
          </optgroup>
        </select>

        {/* CRM Risk Alert Container */}
        {clienteId && clienteId !== "NUEVO" && (
           (() => {
              const cli = clientes.find(c => c.id === clienteId);
              if (!cli || (cli.calificacion === 'NEUTRAL' && !cli.notas_internas)) return null;

              const isMalo = cli.calificacion === 'MALO' || cli.calificacion === 'LISTA_NEGRA';
              const isBueno = cli.calificacion === 'BUENO';

              return (
                 <div className={`mt-3 mb-4 p-4 rounded-2xl border ${isMalo ? 'bg-red-50 border-red-200' : isBueno ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'} flex flex-col gap-2 animate-in fade-in slide-in-from-top-2`}>
                   <div className="flex items-center justify-between">
                     <span className={`text-[10px] uppercase font-black tracking-widest ${isMalo ? 'text-red-600' : isBueno ? 'text-emerald-600' : 'text-amber-600'}`}>
                        Calificación Admin
                     </span>
                     <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${isMalo ? 'bg-red-200 text-red-800' : isBueno ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800'}`}>
                        {cli.calificacion.replace('_', ' ')}
                     </span>
                   </div>
                   {cli.notas_internas && (
                     <div className="mt-1 pt-2 border-t border-black/5">
                        <p className={`text-xs font-bold ${isMalo ? 'text-red-900' : isBueno ? 'text-emerald-900' : 'text-amber-900'}`}>{cli.notas_internas}</p>
                     </div>
                   )}
                 </div>
              );
           })()
        )}
        
        {/* Dynamic New Client Fields */}
        {clienteId === "NUEVO" && (
           <div className="mt-4 space-y-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 animate-in zoom-in-95">
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-2">Datos del Nuevo Cliente</p>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nombre Completo</label>
                <input required type="text" value={nuevoNombre} onChange={e => setNuevoNombre(e.target.value)} placeholder="Ej. Juan Pérez" className="w-full bg-white border border-slate-100 rounded-xl px-4 py-2.5 text-slate-700 mt-1 focus:ring-2 focus:ring-blue-500/50" />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                 <div>
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">DNI</label>
                   <input required type="text" value={nuevoDni} onChange={e => setNuevoDni(e.target.value)} placeholder="Ej. 30123456" className="w-full bg-white border border-slate-100 rounded-xl px-4 py-2.5 text-slate-700 mt-1 focus:ring-2 focus:ring-blue-500/50" />
                 </div>
                 <div>
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Celular / WP</label>
                   <input required type="text" value={nuevoCelular} onChange={e => setNuevoCelular(e.target.value)} placeholder="Ej. 2645123456" className="w-full bg-white border border-slate-100 rounded-xl px-4 py-2.5 text-slate-700 mt-1 focus:ring-2 focus:ring-blue-500/50" />
                 </div>
              </div>
              <div className="mt-3">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Dirección Completa (Barrio, Calle, N°)</label>
                 <input required type="text" value={nuevaDireccion} onChange={e => setNuevaDireccion(e.target.value)} placeholder="Ej. Barrio Los Pinos, Calle 1, Mzna A Casa 12" className="w-full bg-white border border-slate-100 rounded-xl px-4 py-2.5 text-slate-700 mt-1 focus:ring-2 focus:ring-blue-500/50" />
              </div>
           </div>
        )}
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
          clienteNombre={clienteId === "NUEVO" ? (nuevoNombre || "Nuevo Cliente") : (clientes.find(c => c.id === clienteId)?.nombre_apellido || "Desconocido")}
          clienteDireccion={clienteId === "NUEVO" ? (nuevaDireccion || "-") : (clientes.find(c => c.id === clienteId)?.direccion_negocio || clientes.find(c => c.id === clienteId)?.direccion_personal || "Sin dirección")}
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

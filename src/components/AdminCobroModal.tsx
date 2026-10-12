"use client";

import { useState, useTransition } from "react";
import { X, CheckCircle, DollarSign, Bell, Hash, Wallet, ArrowRight } from "lucide-react";
import { asentarPagoPorAdmin } from "@/actions/admin";

interface AdminCobroModalProps {
  cuota: {
    id: string;
    numero_cuota: number;
    valor: number;
    monto_pagado: number;
    prestamo?: {
      codigo?: string;
      cliente?: {
        nombre_apellido?: string;
      };
      cobrador?: {
        nombre?: string;
      };
    };
  };
  clienteNombre?: string;
  prestamoCodigo?: string;
  cobradorNombre?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AdminCobroModal({
  cuota,
  clienteNombre,
  prestamoCodigo,
  cobradorNombre,
  onClose,
  onSuccess
}: AdminCobroModalProps) {
  const [isPending, startTransition] = useTransition();
  const [modo, setModo] = useState<"TOTAL" | "PARCIAL">("TOTAL");
  const [montoParcialStr, setMontoParcialStr] = useState("");
  const [medioPago, setMedioPago] = useState<"TRANSFERENCIA" | "EFECTIVO">("TRANSFERENCIA");
  const [errorMsg, setErrorMsg] = useState("");

  const nombreFinal = clienteNombre || cuota.prestamo?.cliente?.nombre_apellido || "Cliente";
  const codigoFinal = prestamoCodigo || cuota.prestamo?.codigo || "S/R";
  const cobradorFinal = cobradorNombre || cuota.prestamo?.cobrador?.nombre || "Cobrador asignado";

  const saldoRestante = cuota.valor - cuota.monto_pagado;

  const handleMontoParcialChange = (val: string) => {
    const cleaned = val.replace(/[^0-9]/g, "");
    setMontoParcialStr(cleaned);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    let montoNumeric = saldoRestante;
    if (modo === "PARCIAL") {
      montoNumeric = parseInt(montoParcialStr, 10);
      if (isNaN(montoNumeric) || montoNumeric <= 0) {
        setErrorMsg("Ingrese un monto válido mayor a 0.");
        return;
      }
      if (montoNumeric > saldoRestante) {
        setErrorMsg(`El monto ($${montoNumeric.toLocaleString('es-AR')}) supera el saldo adeudado ($${saldoRestante.toLocaleString('es-AR')}).`);
        return;
      }
    }

    startTransition(async () => {
      const res = await asentarPagoPorAdmin(cuota.id, montoNumeric, medioPago);
      if (res.success) {
        alert("¡Pago asentado con éxito! Se notificó al cobrador.");
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setErrorMsg(res.error || "Error al asentar el pago.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose}></div>

      <div className="bg-white w-full max-w-md rounded-[2rem] p-6 shadow-2xl border border-slate-100 relative z-10 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg w-fit text-[10px] font-black uppercase tracking-wider mb-2">
              <Wallet size={13} />
              Asentar Pago (cmiranda)
            </div>
            <h3 className="font-black text-2xl text-slate-800 leading-tight uppercase">
              {nombreFinal}
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Ref: {codigoFinal} • Cuota N° {cuota.numero_cuota}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold mb-4 border border-red-100 animate-in shake">
            {errorMsg}
          </div>
        )}

        {/* Resumen Financiero de Cuota */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-2xl text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
              Valor de Cuota
            </span>
            <span className="text-lg font-black text-slate-700">
              ${cuota.valor.toLocaleString("es-AR")}
            </span>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-2xl text-center">
            <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider block mb-1">
              Saldo Pendiente
            </span>
            <span className="text-xl font-black text-emerald-700">
              ${saldoRestante.toLocaleString("es-AR")}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Selector de Modo: Total o Parcial */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 px-1">
              Modalidad de Pago
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setModo("TOTAL")}
                className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all border-2 ${
                  modo === "TOTAL"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-500 shadow-sm"
                    : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"
                }`}
              >
                Total (${saldoRestante.toLocaleString("es-AR")})
              </button>
              <button
                type="button"
                onClick={() => setModo("PARCIAL")}
                className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all border-2 ${
                  modo === "PARCIAL"
                    ? "bg-orange-50 text-orange-700 border-orange-500 shadow-sm"
                    : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"
                }`}
              >
                Entrega Parcial
              </button>
            </div>
          </div>

          {/* Input para Pago Parcial */}
          {modo === "PARCIAL" && (
            <div className="bg-orange-50/70 p-4 rounded-2xl border border-orange-200/80 text-center animate-in zoom-in-95">
              <label className="text-[10px] font-black text-orange-600 uppercase tracking-widest block mb-2">
                Ingresar Monto a Asentar
              </label>
              <div className="relative max-w-[180px] mx-auto">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xl font-black text-orange-400">
                  $
                </span>
                <input
                  type="text"
                  autoFocus
                  value={montoParcialStr}
                  onChange={(e) => handleMontoParcialChange(e.target.value)}
                  placeholder="0"
                  className="w-full bg-white border-2 border-orange-300 rounded-xl pl-8 pr-3 py-2 text-2xl text-center font-black text-orange-600 focus:outline-none focus:border-orange-500 shadow-inner"
                />
              </div>
            </div>
          )}

          {/* Selector de Método de Pago */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 px-1">
              Medio de Cobro
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMedioPago("TRANSFERENCIA")}
                className={`flex-1 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all border-2 ${
                  medioPago === "TRANSFERENCIA"
                    ? "bg-blue-50 text-blue-700 border-blue-500 shadow-sm"
                    : "bg-white text-slate-400 border-slate-200"
                }`}
              >
                Transferencia
              </button>
              <button
                type="button"
                onClick={() => setMedioPago("EFECTIVO")}
                className={`flex-1 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all border-2 ${
                  medioPago === "EFECTIVO"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-500 shadow-sm"
                    : "bg-white text-slate-400 border-slate-200"
                }`}
              >
                Efectivo
              </button>
            </div>
          </div>

          {/* Aviso de Notificación al Cobrador */}
          <div className="bg-indigo-50/70 border border-indigo-100 p-3.5 rounded-2xl flex items-start gap-2.5">
            <Bell size={18} className="text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-[11px] text-indigo-900 leading-relaxed font-medium">
              Al confirmar, el sistema enviará una notificación inmediata a{" "}
              <strong className="text-indigo-950 font-bold">{cobradorFinal}</strong>{" "}
              avisando que la administración ya cobró esta cuota.
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3.5 rounded-2xl text-xs transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={
                isPending ||
                (modo === "PARCIAL" &&
                  (!montoParcialStr || parseInt(montoParcialStr) === 0))
              }
              className="flex-[2] bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-sm py-3.5 rounded-2xl shadow-lg shadow-emerald-600/30 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {isPending ? (
                "Asentando..."
              ) : (
                <>
                  <CheckCircle size={18} /> Asentar y Notificar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

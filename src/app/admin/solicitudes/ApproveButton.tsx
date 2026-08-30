"use client";

import { useTransition, useState } from "react";
import { approvePrestamo } from "@/actions/prestamos";
import { CheckCircle, MessageCircle } from "lucide-react";

export default function ApproveButton({ prestamoId, clienteVal, cobradorNum, monto, cuotas, modalidad }: { prestamoId: string, clienteVal: string, cobradorNum: string, monto: number, cuotas: number, modalidad: string }) {
  const [isPending, startTransition] = useTransition();
  const [approved, setApproved] = useState(false);

  const handleApprove = () => {
    startTransition(async () => {
      const res = await approvePrestamo(prestamoId);
      if (res.success) {
        setApproved(true);
      } else {
        alert(res.error || "Error al aprobar");
      }
    });
  };

  if (approved) {
    const waText = encodeURIComponent(`Hola ${clienteVal}, tu solicitud de préstamo con RYB por $${monto.toLocaleString('es-AR')} en ${cuotas} cuotas (${modalidad}) ha sido APROBADA y el crédito ya fue cargado. ¡Gracias por elegirnos!`);
    const waLink = cobradorNum ? `https://wa.me/${cobradorNum}?text=${waText}` : `https://wa.me/?text=${waText}`;

    return (
      <div className="flex flex-col gap-2">
         <span className="text-emerald-600 font-bold flex items-center justify-end gap-1 text-sm"><CheckCircle size={16}/> Aprobado (Activo)</span>
         <a href={waLink} target="_blank" rel="noreferrer" className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-emerald-100 transition-colors">
            <MessageCircle size={14}/> Avisar al Cliente por WhatsApp
         </a>
      </div>
    );
  }

  return (
    <button 
      onClick={handleApprove}
      disabled={isPending}
      className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-emerald-500 disabled:opacity-50 transition-colors"
    >
      {isPending ? "Cargando..." : "Aprobar y Cargar Crédito"}
    </button>
  );
}

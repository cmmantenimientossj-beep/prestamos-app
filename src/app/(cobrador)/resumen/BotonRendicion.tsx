"use client";

import { useTransition } from "react";
import { solicitarRendicion } from "@/actions/recaudaciones";

export default function BotonRendicion({ cobradorId, efectivo, transferencias, cantCuotas, disable }: { cobradorId: string, efectivo: number, transferencias: number, cantCuotas: number, disable: boolean }) {
  const [isPending, startTransition] = useTransition();

  const handleRendir = () => {
    if (efectivo + transferencias === 0) {
      alert("No hay dinero nuevo para rendir.");
      return;
    }
    
    startTransition(async () => {
       const res = await solicitarRendicion(cobradorId, efectivo, transferencias, cantCuotas);
       if (res.success) {
         alert("La rendición fue enviada al administrador con éxito.");
       } else {
         alert(`Error: ${res.error}`);
       }
    });
  }

  return (
    <button 
      onClick={handleRendir}
      disabled={isPending || disable || (efectivo + transferencias === 0)}
      className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:active:scale-100 border border-slate-800 text-white font-black text-lg py-4 rounded-2xl shadow-lg shadow-slate-900/20 active:scale-95 transition-all flex justify-center items-center gap-2"
    >
      {isPending ? "Enviando Solicitud..." : disable ? "Rendición Pendiente" : "Enviar Rendición al Admin"}
    </button>
  )
}

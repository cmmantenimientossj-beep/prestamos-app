"use client";

import { useTransition, useState } from "react";
import { rejectPrestamo } from "@/actions/prestamos";
import { MessageCircle, X } from "lucide-react";

export default function RejectButton({ prestamoId, cobradorCelular }: { prestamoId: string; cobradorCelular: string }) {
  const [isPending, startTransition] = useTransition();
  const [modalOpen, setModalOpen] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [rejected, setRejected] = useState(false);

  const handleReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!motivo) return alert("Por favor ingresa un motivo para el rechazo.");

    startTransition(async () => {
      const res = await rejectPrestamo(prestamoId, motivo);
      if (res.success) {
        setRejected(true);
        setModalOpen(false);
      } else {
        alert(res.error || "Error al rechazar");
      }
    });
  };

  if (rejected) {
     const waText = encodeURIComponent(`Hola, tu solicitud de préstamo fue RECHAZADA.\nMotivo: "${motivo}"\nPor favor, corrígela y vuelve a enviarla.`);
     const waLink = cobradorCelular ? `https://wa.me/${cobradorCelular}?text=${waText}` : `https://wa.me/?text=${waText}`;
     return (
       <div className="flex flex-col gap-2">
         <span className="text-red-500 font-bold block text-sm flex items-center justify-end gap-1">❌ Solicitud Rechazada</span>
         <a href={waLink} target="_blank" rel="noreferrer" className="bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-red-100 transition-colors">
            <MessageCircle size={14}/> Avisar Rechazo al Cobrador
         </a>
       </div>
     );
  }

  return (
    <>
      <button 
        onClick={() => setModalOpen(true)}
        disabled={isPending}
        className="bg-red-50 text-red-600 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm border border-red-200 hover:bg-red-100 disabled:opacity-50 transition-colors"
      >
        Rechazar
      </button>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="absolute inset-0" onClick={() => setModalOpen(false)}></div>
           <div className="bg-white w-full max-w-lg mx-auto sm:mb-8 rounded-t-[2rem] sm:rounded-3xl p-6 relative z-10 shadow-2xl animate-in slide-in-from-bottom-[50%] duration-300">
              <button type="button" onClick={() => setModalOpen(false)} className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors">
                <X size={20} />
              </button>
              
              <h3 className="font-black text-xl text-slate-800 mb-1">Rechazar Solicitud</h3>
              <p className="text-sm text-slate-500 font-bold mb-4">Ingresa el motivo del rechazo. Esta observación le llegará directamente al cobrador.</p>
              
              <form onSubmit={handleReject}>
                 <textarea 
                   autoFocus
                   required
                   value={motivo} 
                   onChange={e => setMotivo(e.target.value)}
                   className="w-full bg-slate-50 border border-red-100 rounded-xl p-4 text-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/50 min-h-[100px] mb-4"
                   placeholder="Ej: Faltó especificar si es Mzna A o B en el barrio..."
                 />
                 <button type="submit" disabled={isPending || !motivo} className="w-full bg-red-600 disabled:opacity-50 text-white font-black text-lg py-3 rounded-2xl shadow-lg shadow-red-500/40 active:scale-95 transition-transform">
                   {isPending ? "Rechazando..." : "Confirmar Rechazo Definitivo"}
                 </button>
              </form>
           </div>
        </div>
      )}
    </>
  );
}

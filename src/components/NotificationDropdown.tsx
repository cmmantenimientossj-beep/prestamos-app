"use client";

import { Bell, X, Check, Send, UserSearch } from "lucide-react";
import { useState, useEffect, useTransition } from "react";
import { getNotificaciones, marcarNotificacionesLeidas, emitirMensajeManual } from "@/actions/notificaciones";

interface CobradorMini {
  id: string;
  nombre: string;
}

export default function NotificationDropdown({ usuarioId, role, cobradoresDisponibles }: { usuarioId: string, role: string, cobradoresDisponibles: CobradorMini[] }) {
  const [open, setOpen] = useState(false);
  const [notificaciones, setNotificaciones] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();

  // For Admin Sending
  const [sendMode, setSendMode] = useState(false);
  const [targetId, setTargetId] = useState("");
  const [mensaje, setMensaje] = useState("");

  const refreshNotifs = async () => {
     const data = await getNotificaciones(usuarioId);
     setNotificaciones(data);
  };

  useEffect(() => {
     refreshNotifs();
     // Simple polling every 1 minute
     const i = setInterval(refreshNotifs, 60000);
     return () => clearInterval(i);
  }, [usuarioId]);

  const unreadCount = notificaciones.filter(n => !n.leida).length;

  const handleOpen = () => {
     setOpen(true);
     setSendMode(false);
     if (unreadCount > 0) {
        startTransition(async () => {
           await marcarNotificacionesLeidas(usuarioId);
           refreshNotifs(); // optimistically wait, though the count will drop naturally
        });
     }
  };

  const handleSend = (e: React.FormEvent) => {
     e.preventDefault();
     if (!targetId || !mensaje) return;
     startTransition(async () => {
        const res = await emitirMensajeManual(usuarioId, targetId, "Mensaje del Administrador", mensaje);
        if (res.success) {
           setSendMode(false);
           setMensaje("");
           setTargetId("");
           alert("Mensaje emitido con éxito.");
        } else {
           alert("Error: " + res.error);
        }
     });
  };

  return (
    <div className="relative">
      <button 
        onClick={() => open ? setOpen(false) : handleOpen()}
        className="relative p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors flex items-center justify-center"
      >
        <Bell size={20} className={role === "ADMIN" ? "text-slate-600" : "text-white"} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full border-2 border-emerald-600 text-[8px] font-black text-white flex items-center justify-center animate-bounce">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
         <>
           <div className="fixed inset-0 z-40 bg-slate-900/10 backdrop-blur-sm" onClick={() => setOpen(false)}></div>
           <div className="absolute right-0 top-12 sm:top-10 mt-2 w-[90vw] sm:w-[400px] max-w-[400px] bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 overflow-hidden flex flex-col max-h-[80vh] sm:max-h-[500px] pb-4 animate-in slide-in-from-top-4 duration-200">
             
             {/* Header */}
             <div className="bg-slate-50 px-5 py-4 border-b border-slate-100 flex justify-between items-center z-10 sticky top-0">
               <div>
                  <h3 className="font-black text-slate-800 text-lg">Notificaciones</h3>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest leading-none mt-0.5">Centro de Alertas</p>
               </div>
               
               <div className="flex items-center gap-2">
                 {role === "ADMIN" && !sendMode && (
                   <button 
                     onClick={() => setSendMode(true)}
                     className="bg-blue-100 text-blue-700 hover:bg-blue-200 p-1.5 rounded-full transition-colors"
                     title="Enviar Mensaje"
                   >
                     <Send size={16} />
                   </button>
                 )}
                 <button onClick={() => setOpen(false)} className="bg-slate-200 hover:bg-slate-300 text-slate-600 p-1.5 rounded-full transition-colors">
                   <X size={16} />
                 </button>
               </div>
             </div>

             {/* Content Area */}
             <div className="overflow-y-auto flex-1 p-2">
               
               {/* Admin Send Message View */}
               {sendMode && role === "ADMIN" ? (
                 <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 m-2">
                    <button onClick={() => setSendMode(false)} className="text-[10px] font-black uppercase text-blue-600 mb-4 flex items-center gap-1 hover:underline">
                      &larr; Volver a Notificaciones
                    </button>
                    <form onSubmit={handleSend} className="space-y-4">
                       <div>
                         <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Destinatario</label>
                         <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><UserSearch size={16}/></span>
                            <select 
                              required
                              value={targetId}
                              onChange={e => setTargetId(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-colors bg-none"
                            >
                              <option value="" disabled>Seleccione cobrador...</option>
                              {cobradoresDisponibles.map(c => (
                                <option key={c.id} value={c.id}>{c.nombre}</option>
                              ))}
                            </select>
                         </div>
                       </div>
                       <div>
                         <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Comunicado</label>
                         <textarea
                           required
                           value={mensaje}
                           onChange={e => setMensaje(e.target.value)}
                           className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 transition-colors min-h-[100px]"
                           placeholder="Ej: Recuerda cerrar sesión antes de irte..."
                         />
                       </div>
                       <button 
                         type="submit" 
                         disabled={isPending || !targetId || !mensaje}
                         className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black shadow-md disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                       >
                         {isPending ? "Enviando..." : <><Send size={16}/> Emitir Comunicado</>}
                       </button>
                    </form>
                 </div>
               ) : (
                 /* Normal Feed View */
                 <div className="space-y-1.5 p-1">
                   {notificaciones.length === 0 ? (
                     <div className="text-center py-10 px-4">
                       <Check size={40} className="mx-auto text-slate-200 mb-2" />
                       <p className="text-slate-500 font-bold">Todo al día</p>
                       <p className="text-xs text-slate-400">No tienes notificaciones pendientes.</p>
                     </div>
                   ) : (
                     notificaciones.map(n => (
                       <div key={n.id} className={`p-4 rounded-2xl border transition-all ${n.leida ? 'bg-white border-slate-100 opacity-70' : 'bg-emerald-50 border-emerald-100'}`}>
                         <h4 className={`text-sm mb-1 line-clamp-1 ${n.leida ? 'font-bold text-slate-700' : 'font-black text-emerald-800'}`}>{n.titulo}</h4>
                         <p className="text-xs text-slate-600 font-medium leading-relaxed">{n.mensaje}</p>
                         <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mt-3 text-right">
                           {new Date(n.fecha).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}
                         </p>
                       </div>
                     ))
                   )}
                 </div>
               )}
               
             </div>
           </div>
         </>
      )}
    </div>
  );
}

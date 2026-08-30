"use client";

import { useState, useTransition, useMemo } from "react";
import { Search, MapPin, MessageCircle, ChevronRight, X, CheckCircle, Copy, User, Hash, DollarSign, CalendarClock } from "lucide-react";
import { cobrarCuota, reprogramarCuota } from "@/actions/rutas";
import Link from "next/link";

const MESES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
const getFormattedDate = (date: Date) => `${date.getDate()} de ${MESES[date.getMonth()]}`;

export default function MisRutasList({ initialCuotas }: { initialCuotas: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<"ATRASADOS" | "HOY" | "MANANA">("HOY");
  const [search, setSearch] = useState("");
  const [procesadosIds, setProcesadosIds] = useState<string[]>([]);

  // Drawer states
  const [cobroModalItem, setCobroModalItem] = useState<any>(null); 
  const [modalMode, setModalMode] = useState<"MAIN" | "TOTAL" | "PARCIAL">("MAIN");
  const [montoParcialStr, setMontoParcialStr] = useState(""); 
  const [medioPago, setMedioPago] = useState<"EFECTIVO" | "TRANSFERENCIA">("EFECTIVO");
  
  // Success state for Whatsapp
  const [pagoExitoso, setPagoExitoso] = useState<{cuota: any, monto: number} | null>(null);

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const adminAlias = process.env.NEXT_PUBLIC_ADMIN_ALIAS || "SOLUCIONES.RYB.MP";

  const grupos = useMemo(() => {
    const atrasados: any[] = [];
    const hoy: any[] = [];
    const manana: any[] = [];

    initialCuotas.forEach(c => {
      const vStr = new Date(c.fecha_vencimiento).toISOString().split("T")[0];
      if (vStr < todayStr) atrasados.push(c);
      else if (vStr === todayStr) hoy.push(c);
      else if (vStr === tomorrowStr) manana.push(c);
    });

    return { ATRASADOS: atrasados, HOY: hoy, MANANA: manana };
  }, [initialCuotas, todayStr, tomorrowStr]);

  const displayedList = (grupos[activeTab] || []).filter(c => 
    !procesadosIds.includes(c.id) &&
    (c.prestamo.cliente.nombre_apellido.toLowerCase().includes(search.toLowerCase()) ||
    (c.prestamo.cliente.direccion_negocio || "").toLowerCase().includes(search.toLowerCase()))
  );

  const handleAbonoChange = (val: string) => {
     let cleaned = val.replace(/[^0-9]/g, ""); 
     setMontoParcialStr(cleaned);
  };

  const closeDrawer = () => {
    setCobroModalItem(null);
    setModalMode("MAIN");
    setMedioPago("EFECTIVO");
    setMontoParcialStr("");
  };

  const handleCobroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cobroModalItem) return;
    
    const aCobrarTotal = cobroModalItem.valor - cobroModalItem.monto_pagado;
    let abonoNumeric = aCobrarTotal;

    if (modalMode === "PARCIAL") {
      abonoNumeric = parseInt(montoParcialStr, 10);
      if (isNaN(abonoNumeric) || abonoNumeric <= 0 || abonoNumeric > aCobrarTotal) {
        return alert("Ingrese un monto válido y menor al total adeudado.");
      }
    }

    startTransition(async () => {
      const res = await cobrarCuota(cobroModalItem.id, abonoNumeric, medioPago);
      if (res.success) {
        setProcesadosIds(prev => [...prev, cobroModalItem.id]); // Ocultar visualmente
        setPagoExitoso({ cuota: cobroModalItem, monto: abonoNumeric });
        closeDrawer();
      } else {
        alert(res.error || "Error al registrar avance");
      }
    });
  };

  const handleReprogramar = () => {
    if (!cobroModalItem) return;
    const confirm = window.confirm("¿Estás seguro de pasar este cobro para el día de MAÑANA?");
    if (!confirm) return;

    startTransition(async () => {
      const m = new Date(tomorrowStr + "T12:00:00");
      const res = await reprogramarCuota(cobroModalItem.id, m);
      if (res.success) {
        setProcesadosIds(prev => [...prev, cobroModalItem.id]);
        closeDrawer();
      } else {
         alert(res.error || "Error al pasar cuota");
      }
    });
  };

  return (
    <>
      <div className="flex gap-2 mb-6">
        <button onClick={() => setActiveTab("ATRASADOS")} className={`flex-1 relative py-2.5 rounded-xl font-bold border-2 transition-all ${activeTab === 'ATRASADOS' ? 'bg-red-50 border-red-500 text-red-600 shadow-sm' : 'bg-white border-transparent text-slate-400 opacity-80'}`}>
          <span className="block mb-1">Atrasados</span>
          {grupos.ATRASADOS.filter(c => !procesadosIds.includes(c.id)).length > 0 && (
             <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center shadow-md animate-in zoom-in">{grupos.ATRASADOS.filter(c => !procesadosIds.includes(c.id)).length}</span>
          )}
        </button>
        <button onClick={() => setActiveTab("HOY")} className={`flex-1 relative py-2.5 rounded-xl font-bold border-2 transition-all ${activeTab === 'HOY' ? 'bg-emerald-50 border-emerald-500 text-emerald-600 shadow-sm' : 'bg-white border-transparent text-slate-400 opacity-80'}`}>
          <span className="block leading-none mb-1">Hoy</span>
          <span className="text-[9px] uppercase block tracking-widest opacity-80 border-t border-current pt-1 mx-2">{getFormattedDate(now)}</span>
          {grupos.HOY.filter(c => !procesadosIds.includes(c.id)).length > 0 && (
             <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] font-black min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center shadow-md animate-in zoom-in">{grupos.HOY.filter(c => !procesadosIds.includes(c.id)).length}</span>
          )}
        </button>
        <button onClick={() => setActiveTab("MANANA")} className={`flex-1 relative py-2.5 rounded-xl font-bold border-2 transition-all ${activeTab === 'MANANA' ? 'bg-blue-50 border-blue-500 text-blue-600 shadow-sm' : 'bg-white border-transparent text-slate-400 opacity-80'}`}>
          <span className="block leading-none mb-1">Mañana</span>
          <span className="text-[9px] uppercase block tracking-widest opacity-80 border-t border-current pt-1 mx-2">{getFormattedDate(tomorrow)}</span>
          {grupos.MANANA.filter(c => !procesadosIds.includes(c.id)).length > 0 && (
             <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] font-black min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center shadow-md animate-in zoom-in">{grupos.MANANA.filter(c => !procesadosIds.includes(c.id)).length}</span>
          )}
        </button>
      </div>

      <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 mb-6 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar zona o cliente..." 
            className="w-full bg-slate-50 border-none rounded-xl pl-10 pr-4 py-2 text-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>
      </div>

      <div className="space-y-3 pb-8">
        {displayedList.length === 0 ? (
          <div className="text-center p-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 animate-in fade-in">
            <h3 className="font-bold text-slate-500">Lista Completa</h3>
            <p className="text-sm text-slate-400 mt-1">Acá no hay nada pendiente.\nSi procesaste cuotas, irán apareciendo en tu Historial.</p>
          </div>
        ) : (
          displayedList.map(cuota => {
            const cliente = cuota.prestamo.cliente;
            const themeColor = activeTab === 'ATRASADOS' ? 'bg-red-500' : activeTab === 'MANANA' ? 'bg-blue-500' : 'bg-emerald-500';

            return (
              <button 
                key={cuota.id} 
                onClick={() => setCobroModalItem(cuota)}
                className="w-full bg-white text-left p-4 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 flex justify-between items-center active:scale-95 transition-transform animate-in slide-in-from-bottom-2 duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-1.5 h-7 rounded-full ${themeColor}`}></div>
                  <span className="font-black text-slate-800 uppercase tracking-tight text-[15px]">{cliente.nombre_apellido}</span>
                </div>
                <div className="flex items-center gap-2">
                  {cuota.estado === "PARCIAL" && (
                    <span className="bg-orange-100 text-orange-600 font-bold text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">Parcial</span>
                  )}
                  <ChevronRight className="text-slate-300" size={18} />
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* DRAWER MODAL - MANAGER */}
      {cobroModalItem && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="absolute inset-0" onClick={closeDrawer}></div>
           
           <div className="bg-white w-full rounded-t-[2rem] p-5 pb-8 relative z-10 shadow-2xl animate-in slide-in-from-bottom-[60%] flex flex-col max-h-[95vh] overflow-y-auto">
              <button onClick={closeDrawer} className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors">
                <X size={20} />
              </button>
              
              <h3 className="font-black text-2xl text-slate-800 mb-1 uppercase pr-10">{cobroModalItem.prestamo.cliente.nombre_apellido}</h3>
              <p className="text-[13px] text-slate-500 font-medium mb-5 flex gap-1 items-center bg-slate-50 py-1.5 px-3 rounded-xl border border-slate-100 w-fit">
                <MapPin size={14}/> {cobroModalItem.prestamo.cliente.direccion_negocio || cobroModalItem.prestamo.cliente.direccion_personal || "Sin dirección cargada"}
              </p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-2xl flex flex-col items-center justify-center text-center">
                   <p className="text-[10px] uppercase font-bold text-indigo-500 tracking-wider mb-1">Cuota N°</p>
                   <p className="text-xl font-black text-indigo-700 flex items-center gap-1"><Hash size={18}/> {cobroModalItem.numero_cuota}</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-2xl flex flex-col items-center justify-center text-center">
                   <p className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider mb-1">Valor Restante</p>
                   <p className="text-xl font-black text-emerald-700 flex items-center gap-0.5"><DollarSign size={18} strokeWidth={3}/> {(cobroModalItem.valor - cobroModalItem.monto_pagado).toLocaleString("es-AR")}</p>
                </div>
              </div>

              {/* ACTION SELECTOR VIEW */}
              {modalMode === "MAIN" && (
                 <div className="flex flex-col gap-3">
                    <button 
                      onClick={() => setModalMode("TOTAL")}
                      className="w-full bg-emerald-500 text-white font-black text-lg py-4 rounded-2xl shadow-[0_4px_20px_-5px_rgba(16,185,129,0.5)] active:scale-[0.98] transition-transform flex justify-center items-center gap-2"
                    >
                      <CheckCircle size={20}/> Cobrar Total de Cuota
                    </button>
                    <button 
                      onClick={() => setModalMode("PARCIAL")}
                      className="w-full bg-orange-100 text-orange-700 border border-orange-200 font-black text-base py-3.5 rounded-2xl active:scale-[0.98] transition-transform"
                    >
                      Entregar a Cuenta (Parcial)
                    </button>
                    <button 
                      onClick={handleReprogramar}
                      disabled={isPending}
                      className="w-full bg-slate-100 text-slate-500 hover:bg-slate-200 font-black text-base py-3.5 rounded-2xl active:scale-[0.98] transition-transform flex items-center gap-2 justify-center"
                    >
                      <CalendarClock size={16}/> Pasar de Día (Mañana)
                    </button>
                 </div>
              )}

              {/* PAYMENT CONFIG VIEW (Total or Parcial) */}
              {(modalMode === "TOTAL" || modalMode === "PARCIAL") && (
                <form onSubmit={handleCobroSubmit} className="animate-in slide-in-from-right-4 duration-300 fill-mode-both">
                   {modalMode === "PARCIAL" && (
                    <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 mb-4 text-center">
                       <label className="text-[10px] font-bold text-orange-400 uppercase tracking-widest block mb-2">Ingresar Abono Parcial</label>
                       <div className="relative max-w-[200px] mx-auto">
                         <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-black text-orange-400">$</span>
                         <input 
                           type="text" autoFocus value={montoParcialStr} onChange={e => handleAbonoChange(e.target.value)}
                           className="w-full bg-white border-2 border-orange-200 rounded-xl pl-9 pr-4 py-2.5 text-2xl text-center font-black text-orange-600 focus:outline-none focus:border-orange-400 transition-colors shadow-sm"
                         />
                       </div>
                    </div>
                   )}

                   <div className="mb-6">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 px-1">Método de Pago</label>
                     <div className="flex gap-2">
                       <button type="button" onClick={() => setMedioPago("EFECTIVO")} className={`flex-1 py-3 rounded-xl font-black text-[13px] uppercase tracking-wider transition-all border-2 ${medioPago === 'EFECTIVO' ? 'bg-emerald-50 text-emerald-600 border-emerald-500' : 'bg-white text-slate-400 border-slate-100'}`}>
                          Efectivo
                       </button>
                       <button type="button" onClick={() => setMedioPago("TRANSFERENCIA")} className={`flex-1 py-3 rounded-xl font-black text-[13px] uppercase tracking-wider transition-all border-2 ${medioPago === 'TRANSFERENCIA' ? 'bg-blue-50 text-blue-600 border-blue-500' : 'bg-white text-slate-400 border-slate-100'}`}>
                          Transferencia
                       </button>
                     </div>
                   </div>

                   {medioPago === "TRANSFERENCIA" && (
                     <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl mb-6 text-center animate-in zoom-in-95">
                        <p className="text-[10px] uppercase tracking-widest font-black text-orange-400 mb-1">Transferir estrictamente a</p>
                        <p className="text-xl font-black text-orange-600 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-transform" onClick={() => navigator.clipboard.writeText(adminAlias)}>
                          {adminAlias} <Copy size={16}/>
                        </p>
                        <p className="text-xs text-orange-500 mt-2 font-bold">Verifica recepción antes de confirmar.</p>
                     </div>
                   )}

                   <div className="flex gap-2 mt-2">
                      <button type="button" onClick={() => setModalMode("MAIN")} className="flex-1 bg-slate-100 text-slate-600 font-bold py-3.5 rounded-2xl">
                         Cancelar
                      </button>
                      <button type="submit" disabled={isPending || (modalMode === "PARCIAL" && (!montoParcialStr || parseInt(montoParcialStr) === 0))} className="flex-[2] bg-emerald-600 disabled:opacity-50 text-white font-black text-[15px] py-3.5 rounded-2xl shadow-lg shadow-emerald-500/40 active:scale-95 transition-transform">
                        {isPending ? "Validando..." : `Confirmar Ingreso`}
                      </button>
                   </div>
                </form>
              )}
           </div>
        </div>
      )}

      {/* DRAWER MODAL - SUCCESS WHATSAPP */}
      {pagoExitoso && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white w-full rounded-t-[2rem] p-6 relative z-10 shadow-2xl animate-in slide-in-from-bottom-[50%] duration-300 text-center">
              <div className="mx-auto w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                <CheckCircle size={32} />
              </div>
              <h3 className="font-black text-2xl text-slate-800 mb-1">¡Cobro Exitoso!</h3>
              <p className="text-sm text-slate-500 font-medium mb-8">El pago fue descontado del saldo del cliente.</p>

              <div className="space-y-3">
                 <a 
                   href={`https://wa.me/${pagoExitoso.cuota.prestamo.cliente.celular}?text=${encodeURIComponent(`✅ *RYB PRESTAMOS*\n\nHola ${pagoExitoso.cuota.prestamo.cliente.nombre_apellido}!\nRecibimos correctamente su pago de *$${pagoExitoso.monto.toLocaleString('es-AR')}* correspondiente a la *Cuota N°${pagoExitoso.cuota.numero_cuota}*.\n\nMuchas gracias por su compromiso.`)}`} 
                   target="_blank" rel="noreferrer"
                   className="w-full flex justify-center items-center gap-2 bg-emerald-500 text-white font-black text-lg py-4 rounded-2xl shadow-lg shadow-emerald-500/40 active:scale-95 transition-transform"
                   onClick={() => setPagoExitoso(null)}
                 >
                   <MessageCircle /> Enviar Recibo por WP
                 </a>
                 
                 <div className="flex gap-3">
                   <Link 
                     href={`/print/cuota/${pagoExitoso.cuota.id}`}
                     className="flex-1 bg-slate-100 text-slate-700 font-black text-xs py-4 rounded-2xl active:scale-95 transition-transform uppercase tracking-wider flex justify-center items-center"
                   >
                     Ticket Físico
                   </Link>
                   <button 
                     onClick={() => setPagoExitoso(null)}
                     className="flex-1 bg-slate-100 text-slate-700 font-black text-xs py-4 rounded-2xl active:scale-95 transition-transform uppercase tracking-wider"
                   >
                     Cerrar
                   </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </>
  );
}

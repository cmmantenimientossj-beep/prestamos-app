"use client";

import { useState, useTransition, useMemo } from "react";
import { Search, MapPin, MessageCircle, ChevronRight, Filter, CalendarClock, X, CheckCircle, Copy } from "lucide-react";
import { cobrarCuota, reprogramarCuota } from "@/actions/rutas";
import Link from "next/link";

const MESES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
const getFormattedDate = (date: Date) => `${date.getDate()} de ${MESES[date.getMonth()]}`;

export default function MisRutasList({ initialCuotas }: { initialCuotas: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<"ATRASADOS" | "HOY" | "MANANA">("HOY");
  const [search, setSearch] = useState("");

  // Drawer / Modal states
  const [cobroModalItem, setCobroModalItem] = useState<any>(null); 
  const [montoAbonoStr, setMontoAbonoStr] = useState(""); 
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
    c.prestamo.cliente.nombre_apellido.toLowerCase().includes(search.toLowerCase()) ||
    (c.prestamo.cliente.direccion_negocio || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleAbonoChange = (val: string) => {
     let cleaned = val.replace(/[^0-9]/g, ""); 
     setMontoAbonoStr(cleaned);
  };

  const handleCobroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cobroModalItem) return;
    
    const abonoNumeric = parseInt(montoAbonoStr, 10);
    if (isNaN(abonoNumeric) || abonoNumeric <= 0) return alert("Ingrese un monto válido");

    startTransition(async () => {
      const res = await cobrarCuota(cobroModalItem.id, abonoNumeric, medioPago);
      if (res.success) {
        setPagoExitoso({ cuota: cobroModalItem, monto: abonoNumeric });
        setCobroModalItem(null);
        setMontoAbonoStr("");
        setMedioPago("EFECTIVO");
      } else {
        alert(res.error || "Error al registrar avance");
      }
    });
  };

  const handleReprogramar = (cuotaId: string) => {
    const confirm = window.confirm("¿Estás seguro de pasar este cobro para el día de MAÑANA?");
    if (!confirm) return;

    startTransition(async () => {
      const m = new Date(tomorrowStr + "T12:00:00");
      const res = await reprogramarCuota(cuotaId, m);
      if (!res.success) alert(res.error);
    });
  };

  const aCobrarTotal = cobroModalItem ? cobroModalItem.valor - cobroModalItem.monto_pagado : 0;

  return (
    <>
      <div className="flex gap-2 mb-6">
        <button onClick={() => setActiveTab("ATRASADOS")} className={`flex-1 relative py-2.5 rounded-xl font-bold border-2 transition-all ${activeTab === 'ATRASADOS' ? 'bg-red-50 border-red-500 text-red-600 shadow-sm' : 'bg-white border-transparent text-slate-400 opacity-80'}`}>
          <span className="block mb-1">Atrasados</span>
          {grupos.ATRASADOS.length > 0 && (
             <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center shadow-md animate-in zoom-in">{grupos.ATRASADOS.length}</span>
          )}
        </button>
        <button onClick={() => setActiveTab("HOY")} className={`flex-1 relative py-2.5 rounded-xl font-bold border-2 transition-all ${activeTab === 'HOY' ? 'bg-emerald-50 border-emerald-500 text-emerald-600 shadow-sm' : 'bg-white border-transparent text-slate-400 opacity-80'}`}>
          <span className="block leading-none mb-1">Hoy</span>
          <span className="text-[9px] uppercase block tracking-widest opacity-80 border-t border-current pt-1 mx-2">{getFormattedDate(now)}</span>
          {grupos.HOY.length > 0 && (
             <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] font-black min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center shadow-md animate-in zoom-in">{grupos.HOY.length}</span>
          )}
        </button>
        <button onClick={() => setActiveTab("MANANA")} className={`flex-1 relative py-2.5 rounded-xl font-bold border-2 transition-all ${activeTab === 'MANANA' ? 'bg-blue-50 border-blue-500 text-blue-600 shadow-sm' : 'bg-white border-transparent text-slate-400 opacity-80'}`}>
          <span className="block leading-none mb-1">Mañana</span>
          <span className="text-[9px] uppercase block tracking-widest opacity-80 border-t border-current pt-1 mx-2">{getFormattedDate(tomorrow)}</span>
          {grupos.MANANA.length > 0 && (
             <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] font-black min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center shadow-md animate-in zoom-in">{grupos.MANANA.length}</span>
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

      <div className="space-y-4">
        {displayedList.length === 0 ? (
          <div className="text-center p-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <h3 className="font-bold text-slate-500">Todo limpio</h3>
            <p className="text-sm text-slate-400 mt-1">No hay cuotas en esta categoría.</p>
          </div>
        ) : (
          displayedList.map(cuota => {
            const cliente = cuota.prestamo.cliente;
            const aCobrar = cuota.valor - cuota.monto_pagado;
            const isParcial = cuota.estado === "PARCIAL";

            return (
              <div key={cuota.id} className={`bg-white rounded-2xl p-4 shadow-sm border border-slate-100 relative overflow-hidden transition-transform active:scale-[0.98] ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className={`absolute left-0 top-0 w-1.5 h-full rounded-l-2xl ${activeTab === 'ATRASADOS' ? 'bg-red-500' : activeTab === 'MANANA' ? 'bg-blue-500' : 'bg-emerald-500'}`}></div>
                
                <div className="flex justify-between items-start mb-3 pl-1">
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg leading-tight uppercase">{cliente.nombre_apellido}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 font-medium">
                      <MapPin size={12} /> {cliente.direccion_negocio || cliente.direccion_personal || "Sin dirección"}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase ${isParcial ? 'bg-orange-50 text-orange-600' : 'bg-slate-50 text-slate-600'}`}>
                    Cuota {cuota.numero_cuota}/{cuota.prestamo.cantidad_cuotas}
                  </span>
                </div>

                <div className="flex gap-2 pl-1 mb-4 flex-col sm:flex-row">
                   <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl flex-1 border border-slate-100">
                     <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">A Cobrar</p>
                     <p className="text-xl font-black text-emerald-600">${aCobrar.toLocaleString("es-AR")}</p>
                   </div>
                   <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl flex-1 border border-slate-100">
                     <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Acumulado</p>
                     <p className="text-xl font-black text-slate-700">${cuota.monto_pagado.toLocaleString("es-AR")}</p>
                   </div>
                </div>

                <div className="flex gap-2 pl-1">
                  <button
                    onClick={() => { setCobroModalItem(cuota); setMontoAbonoStr(aCobrar.toString()); }}
                    className="flex-1 bg-emerald-500 text-white font-black py-2.5 rounded-xl shadow-lg shadow-emerald-500/30 flex justify-center items-center gap-2 transition-transform hover:bg-emerald-400"
                  >
                    Recibir Pago <ChevronRight size={16} strokeWidth={3} />
                  </button>
                  <button title="Patear para mañana" onClick={() => handleReprogramar(cuota.id)} className="bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 font-bold px-3 rounded-xl flex items-center text-[11px] uppercase tracking-wider transition-colors">
                    <CalendarClock size={16} className="mr-1.5" /> Pasar
                  </button>
                  <Link href={`/print/cuota/${cuota.id}`} className="bg-slate-100 text-slate-500 hover:text-blue-500 hover:bg-blue-50 py-2.5 px-4 rounded-xl transition-colors flex justify-center items-center font-bold text-xs uppercase" title="Imprimir Ticket Térmico">
                    Ticket
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DRAWER MODAL - COBRO */}
      {cobroModalItem && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="absolute inset-0" onClick={() => setCobroModalItem(null)}></div>
           
           <div className="bg-white w-full rounded-t-[2rem] p-6 relative z-10 shadow-2xl animate-in slide-in-from-bottom-[50%] duration-300">
              <button onClick={() => setCobroModalItem(null)} className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors">
                <X size={20} />
              </button>
              
              <h3 className="font-black text-xl text-slate-800 mb-1">Registrar Recaudación</h3>
              <p className="text-sm text-slate-500 font-medium mb-6">
                Cobrando Cuota #{cobroModalItem.numero_cuota} de {cobroModalItem.prestamo.cliente.nombre_apellido}
              </p>

              <form onSubmit={handleCobroSubmit}>
                 <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-4 relative overflow-hidden">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block text-center mb-3">Monto Recibido</label>
                    
                    <div className="relative max-w-[200px] mx-auto">
                      <span className="absolute left-3 top-1/2 -translate-y-[45%] text-2xl font-black text-emerald-400">$</span>
                      <input 
                        type="text" autoFocus value={montoAbonoStr} onChange={e => handleAbonoChange(e.target.value)}
                        className="w-full bg-white border-2 border-emerald-100/50 rounded-2xl pl-10 pr-4 py-3 text-4xl text-center font-black text-emerald-600 focus:outline-none focus:border-emerald-500 transition-colors shadow-sm"
                      />
                    </div>
                 </div>

                 <div className="mb-6">
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 px-1">Método de Pago</label>
                   <div className="flex gap-2">
                     <button type="button" onClick={() => setMedioPago("EFECTIVO")} className={`flex-1 py-3 rounded-xl font-black text-sm uppercase tracking-wider transition-all border-2 ${medioPago === 'EFECTIVO' ? 'bg-emerald-50 text-emerald-600 border-emerald-500' : 'bg-white text-slate-400 border-slate-100'}`}>
                        Efectivo
                     </button>
                     <button type="button" onClick={() => setMedioPago("TRANSFERENCIA")} className={`flex-1 py-3 rounded-xl font-black text-sm uppercase tracking-wider transition-all border-2 ${medioPago === 'TRANSFERENCIA' ? 'bg-blue-50 text-blue-600 border-blue-500' : 'bg-white text-slate-400 border-slate-100'}`}>
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

                 <button type="submit" disabled={isPending || !montoAbonoStr || parseInt(montoAbonoStr) === 0} className="w-full bg-emerald-600 disabled:opacity-50 text-white font-black text-lg py-4 rounded-2xl shadow-lg shadow-emerald-500/40 active:scale-95 transition-transform">
                   {isPending ? "Validando Operación..." : `Confirmar Ingreso`}
                 </button>
              </form>
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
              <p className="text-sm text-slate-500 font-medium mb-8">La base de datos ha sido actualizada.</p>

              <div className="space-y-3">
                 <a 
                   href={`https://wa.me/${pagoExitoso.cuota.prestamo.cliente.celular}?text=${encodeURIComponent(`✅ *RYB PRESTAMOS*\n\nHola ${pagoExitoso.cuota.prestamo.cliente.nombre_apellido}!\nRecibimos correctamente su pago de *$${pagoExitoso.monto.toLocaleString('es-AR')}* correspondiente a la *Cuota N°${pagoExitoso.cuota.numero_cuota}*.\n\nMuchas gracias por su compromiso.`)}`} 
                   target="_blank" rel="noreferrer"
                   className="w-full flex justify-center items-center gap-2 bg-emerald-500 text-white font-black text-lg py-4 rounded-2xl shadow-lg shadow-emerald-500/40 active:scale-95 transition-transform"
                   onClick={() => setPagoExitoso(null)}
                 >
                   <MessageCircle /> Enviar Recibo de Pago
                 </a>
                 
                 <div className="flex gap-3">
                   <Link 
                     href={`/print/cuota/${pagoExitoso.cuota.id}`}
                     className="flex-1 bg-slate-100 text-slate-700 font-black text-sm py-4 rounded-2xl active:scale-95 transition-transform uppercase tracking-wider"
                   >
                     Ticket Físico
                   </Link>
                   <button 
                     onClick={() => setPagoExitoso(null)}
                     className="flex-1 bg-slate-100 text-slate-700 font-black text-sm py-4 rounded-2xl active:scale-95 transition-transform uppercase tracking-wider"
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

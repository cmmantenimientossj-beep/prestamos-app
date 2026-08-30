"use client";

import { useState } from "react";
import ApproveButton from "./ApproveButton";
import RejectButton from "./RejectButton";
import { ClipboardList, User, FileText, MapPin, Phone, Info, X, DollarSign, CalendarCheck } from "lucide-react";

export default function SolicitudesList({ solicitudes }: { solicitudes: any[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (solicitudes.length === 0) {
     return (
        <div className="bg-white p-8 rounded-3xl text-center border border-slate-200 shadow-sm">
          <ClipboardList size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-700">No hay solicitudes pendientes</h3>
          <p className="text-slate-500">Al momento no tienes solicitudes en espera de aprobación.</p>
        </div>
     );
  }

  const activeSol = solicitudes.find(s => s.id === selectedId);

  // Helper variables for the modal to unify Old vs New client data
  const isNew = activeSol && !activeSol.cliente_id;
  const cNombre = activeSol ? (isNew ? activeSol.nuevo_cliente_nombre_apellido : activeSol.cliente?.nombre_apellido) || "Desconocido" : "";
  const cDni = activeSol ? (isNew ? activeSol.nuevo_cliente_dni : activeSol.cliente?.dni) || "N/A" : "";
  const cTel = activeSol ? (isNew ? activeSol.nuevo_cliente_celular : activeSol.cliente?.celular) || "N/A" : "";
  const cDir = activeSol ? (isNew ? activeSol.nuevo_cliente_direccion_personal : (activeSol.cliente?.direccion_negocio || activeSol.cliente?.direccion_personal)) || "N/A" : "";

  return (
    <div className="space-y-3 pb-8">
       {solicitudes.map(s => {
          const nombreMostrar = s.cliente ? s.cliente.nombre_apellido : (s.nuevo_cliente_nombre_apellido || "Cliente Nuevo");
          return (
             <button 
               key={s.id}
               onClick={() => setSelectedId(s.id)}
               className="w-full bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center hover:bg-slate-50 transition-colors active:scale-[0.98] text-left"
             >
                <div>
                   <h3 className="font-bold text-slate-800 text-[15px] uppercase flex items-center gap-2 line-clamp-1">
                      {nombreMostrar}
                      {!s.cliente_id && <span className="bg-blue-100 text-blue-600 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest whitespace-nowrap">NUEVO</span>}
                   </h3>
                   <p className="text-xs text-slate-500 mt-1 font-semibold flex items-center gap-1 line-clamp-1">
                     Cobrador: <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 truncate max-w-[120px]">{s.cobrador?.nombre || "N/A"}</span>
                   </p>
                </div>
                <div className="text-right shrink-0 ml-2">
                   <p className="font-black text-emerald-700 text-sm">${s.monto_solicitado.toLocaleString('es-AR')}</p>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-0.5">{s.cantidad_cuotas} cuotas</p>
                </div>
             </button>
          )
       })}

       {/* DETAILS MODAL */}
       {activeSol && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="absolute inset-0" onClick={() => setSelectedId(null)}></div>
            <div className="bg-white w-full h-full sm:h-auto sm:max-w-lg mx-auto rounded-none sm:rounded-3xl p-6 md:p-8 relative z-10 shadow-2xl animate-in slide-in-from-bottom-[50%] duration-300 overflow-y-auto">
               
               <button 
                 type="button" 
                 onClick={() => setSelectedId(null)} 
                 className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors"
               >
                 <X size={20} />
               </button>

               <div className="mb-6 mt-2">
                 <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1 flex items-center gap-1">
                   <Info size={12}/> Expediente de Solicitud
                 </p>
                 <h2 className="text-2xl font-black text-slate-800 leading-tight uppercase flex items-center gap-2">
                   {cNombre}
                   {isNew && <span className="bg-blue-100 text-blue-600 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest align-middle">Nuevo</span>}
                 </h2>
               </div>

               {/* Identidad Card */}
               <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-4 space-y-3">
                 <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5"><User size={14}/> Datos Personales</h4>
                 
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <p className="text-[10px] uppercase font-bold text-slate-400">DNI</p>
                     <p className="font-semibold text-slate-700 text-sm">{cDni}</p>
                   </div>
                   <div>
                     <p className="text-[10px] uppercase font-bold text-slate-400">Celular</p>
                     <p className="font-semibold text-slate-700 text-sm">{cTel}</p>
                   </div>
                 </div>
                 
                 <div>
                   <p className="text-[10px] uppercase font-bold text-slate-400">Dirección Constatada</p>
                   <p className="font-semibold text-slate-700 text-sm">{cDir}</p>
                 </div>
               </div>

               {/* Prestamo Card */}
               <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100 mb-6 space-y-3">
                 <h4 className="text-[10px] text-emerald-600/70 font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5"><FileText size={14}/> Detalles del Crédito</h4>
                 
                 <div className="flex border-b border-emerald-100 pb-3">
                   <div className="w-1/2">
                     <p className="text-[10px] uppercase font-bold text-emerald-600/70">Monto Final</p>
                     <p className="font-black text-emerald-800 text-xl">${activeSol.monto_solicitado.toLocaleString('es-AR')}</p>
                   </div>
                   <div className="w-1/2 border-l border-emerald-100 pl-4">
                     <p className="text-[10px] uppercase font-bold text-emerald-600/70">Interés Acordado</p>
                     <p className="font-black text-slate-800 text-lg">{activeSol.porcentaje_interes}%</p>
                   </div>
                 </div>
                 
                 <div className="flex">
                   <div className="w-1/2">
                     <p className="text-[10px] uppercase font-bold text-emerald-600/70">Régimen</p>
                     <p className="font-semibold text-slate-700 text-sm">{activeSol.cantidad_cuotas} cuotas ({activeSol.modalidad.toLowerCase()})</p>
                   </div>
                   <div className="w-1/2 border-l border-emerald-100 pl-4">
                     <p className="text-[10px] uppercase font-bold text-emerald-600/70">Tipo</p>
                     <p className="font-semibold text-slate-700 text-sm">{activeSol.tipo}</p>
                   </div>
                 </div>
               </div>

               <p className="text-xs text-slate-500 font-medium text-center mb-4">
                 Generado por: <span className="font-black text-slate-700">{activeSol.cobrador?.nombre}</span>
               </p>

               {/* Actions */}
               <div className="flex flex-col gap-3">
                 <ApproveButton 
                   prestamoId={activeSol.id} 
                   clienteVal={cNombre} 
                   cobradorNum={cTel} 
                   monto={activeSol.monto_solicitado} 
                   cuotas={activeSol.cantidad_cuotas} 
                   modalidad={activeSol.modalidad}
                 />
                 <RejectButton
                   prestamoId={activeSol.id}
                   cobradorCelular={activeSol.cobrador?.celular || ""}
                 />
               </div>

            </div>
          </div>
       )}
    </div>
  )
}

import { prisma } from "@/lib/prisma";
import ApproveButton from "./ApproveButton";
import RejectButton from "./RejectButton";
import { ClipboardList } from "lucide-react";

export default async function SolicitudesPage() {
  const solicitudes = await prisma.solicitudPrestamo.findMany({
    where: { estado: 'PENDIENTE' },
    include: { cliente: true, cobrador: true },
    orderBy: { fecha_registro: 'desc' }
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Solicitudes de Crédito</h1>
        <p className="text-slate-500 mt-1">Evalúa, aprueba y emite formalmente los préstamos generados por los cobradores.</p>
      </div>

      <div className="space-y-4">
        {solicitudes.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl text-center border border-slate-200 shadow-sm">
            <ClipboardList size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-700">No hay solicitudes pendientes</h3>
            <p className="text-slate-500">Al momento no tienes solicitudes en espera de aprobación.</p>
          </div>
        ) : (
          solicitudes.map(s => {
            const nombreMostrar = s.cliente ? s.cliente.nombre_apellido : (s.nuevo_cliente_nombre_apellido || "Cliente Nuevo");
            const celularMostrar = s.cliente ? s.cliente.celular : s.nuevo_cliente_celular;
            
            return (
            <div key={s.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
               <div className="w-full">
                  <h3 className="font-bold text-slate-800 text-lg uppercase flex items-center gap-2">
                     {nombreMostrar}
                     {!s.cliente_id && <span className="bg-blue-100 text-blue-600 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">NUEVO CONTACTO</span>}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                     <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Monto Solicitado</p>
                        <p className="font-black text-slate-800 text-lg">${s.monto_solicitado.toLocaleString('es-AR')}</p>
                     </div>
                     <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Condiciones</p>
                        <p className="font-black text-slate-800">{s.cantidad_cuotas} cuotas al {s.porcentaje_interes}% <span className="text-slate-400 capitalize">({s.modalidad.toLowerCase()})</span></p>
                     </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-3 font-semibold flex items-center gap-1">Generado por: <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{s.cobrador?.nombre || "Desconocido"}</span></p>
               </div>
               <div className="w-full md:w-auto mt-4 md:mt-0 flex gap-2 justify-end">
                  <RejectButton
                    prestamoId={s.id}
                    cobradorCelular={s.cobrador?.celular || ""}
                  />
                  <ApproveButton 
                    prestamoId={s.id} 
                    clienteVal={nombreMostrar} 
                    cobradorNum={celularMostrar || ""} 
                    monto={s.monto_solicitado} 
                    cuotas={s.cantidad_cuotas} 
                    modalidad={s.modalidad}
                  />
               </div>
            </div>
          )})
        )}
      </div>
    </div>
  );
}

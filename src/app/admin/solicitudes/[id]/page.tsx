import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { User, FileText, MapPin, Phone, Info, ChevronLeft } from "lucide-react";
import ApproveButton from "../ApproveButton";
import RejectButton from "../RejectButton";
import Link from "next/link";

export default async function SolicitudEvaluationPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const sol = await prisma.solicitudPrestamo.findUnique({
    where: { id },
    include: { cliente: true, cobrador: true }
  });

  if (!sol || sol.estado !== 'PENDIENTE') {
    redirect("/admin/solicitudes");
  }

  const isNew = !sol.cliente_id;
  const cNombre = (isNew ? sol.nuevo_cliente_nombre_apellido : sol.cliente?.nombre_apellido) || "Desconocido";
  const cDni = (isNew ? sol.nuevo_cliente_dni : sol.cliente?.dni) || "N/A";
  const cTel = (isNew ? sol.nuevo_cliente_celular : sol.cliente?.celular) || "N/A";
  const cDir = (isNew ? sol.nuevo_cliente_direccion_personal : (sol.cliente?.direccion_negocio || sol.cliente?.direccion_personal)) || "N/A";

  const formatCurrency = (n: number) => {
    return Math.floor(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  return (
    <div className="pb-10 max-w-2xl mx-auto">
      
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/solicitudes" className="p-2 bg-white border border-slate-200 rounded-full text-slate-500 hover:bg-slate-100 transition-colors">
          <ChevronLeft size={20} />
        </Link>
        <div>
           <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest flex items-center gap-1">
             <Info size={12}/> Expediente de Solicitud
           </p>
           <h2 className="text-xl sm:text-2xl font-black text-slate-800 leading-tight uppercase relative top-1">
             {cNombre}
             {isNew && <span className="inline-block ml-2 bg-blue-100 text-blue-600 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest align-middle">Nuevo</span>}
           </h2>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
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
               <p className="font-black text-emerald-800 text-xl" suppressHydrationWarning>${formatCurrency(sol.monto_solicitado)}</p>
             </div>
             <div className="w-1/2 border-l border-emerald-100 pl-4">
               <p className="text-[10px] uppercase font-bold text-emerald-600/70">Interés Acordado</p>
               <p className="font-black text-slate-800 text-lg">{sol.porcentaje_interes}%</p>
             </div>
           </div>
           
           <div className="flex">
             <div className="w-1/2">
               <p className="text-[10px] uppercase font-bold text-emerald-600/70">Régimen</p>
               <p className="font-semibold text-slate-700 text-sm">{sol.cantidad_cuotas} cuotas ({sol.modalidad.toLowerCase()})</p>
             </div>
             <div className="w-1/2 border-l border-emerald-100 pl-4">
               <p className="text-[10px] uppercase font-bold text-emerald-600/70">Tipo</p>
               <p className="font-semibold text-slate-700 text-sm">{sol.tipo}</p>
             </div>
           </div>
         </div>

         <p className="text-xs text-slate-500 font-medium text-center mb-4">
           Generado por: <span className="font-black text-slate-700">{sol.cobrador?.nombre}</span>
         </p>

         {/* Actions */}
         <div className="flex flex-col gap-3">
           <ApproveButton 
             prestamoId={sol.id} 
             clienteVal={cNombre} 
             cobradorNum={cTel} 
             monto={sol.monto_solicitado} 
             cuotas={sol.cantidad_cuotas} 
             modalidad={sol.modalidad}
           />
           <RejectButton
             prestamoId={sol.id}
             cobradorCelular={sol.cobrador?.celular || ""}
           />
         </div>
      </div>
    </div>
  );
}

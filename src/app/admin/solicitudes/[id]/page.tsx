import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { User, FileText, MapPin, Phone, Info, ChevronLeft } from "lucide-react";
import ApproveButton from "../ApproveButton";
import RejectButton from "../RejectButton";
import Link from "next/link";
import { generatePaymentSchedule } from "@/lib/loan-calculator";

export default async function SolicitudEvaluationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

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

  const safeFormatDate = (d: Date) => {
     return d.toISOString().split('T')[0].split('-').reverse().join('/');
  };

  const projection = generatePaymentSchedule({
      monto_solicitado: sol.monto_solicitado,    
      porcentaje_interes: sol.porcentaje_interes,     
      cantidad_cuotas: sol.cantidad_cuotas,
      modalidad: sol.modalidad as any,
      fecha_inicio: sol.fecha_primer_cobro,
  });

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
         <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-4 space-y-4">
           <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5"><User size={14}/> Datos Personales</h4>
           
           <div className="grid grid-cols-2 gap-4">
             <div>
               <p className="text-xs uppercase font-black text-indigo-500 tracking-wider">DNI</p>
               <p className="font-black text-slate-800 text-xl">{cDni}</p>
             </div>
             <div>
               <p className="text-xs uppercase font-black text-indigo-500 tracking-wider">Celular</p>
               <p className="font-black text-slate-800 text-xl">{cTel}</p>
             </div>
           </div>
           
           <div>
             <p className="text-xs uppercase font-black text-indigo-500 tracking-wider">Dirección Constatada</p>
             <p className="font-black text-slate-800 text-xl">{cDir}</p>
           </div>
         </div>

         {/* Prestamo Card */}
         <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-200 mb-6 space-y-5">
           <h4 className="text-[10px] text-emerald-600/70 font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5"><FileText size={14}/> Detalles Financieros</h4>
           
           <div className="flex border-b border-emerald-100 pb-4">
             <div className="w-1/2">
               <p className="text-xs uppercase font-black text-emerald-600 tracking-wider">Monto Prestado</p>
               <p className="font-black text-slate-800 text-2xl mt-1" suppressHydrationWarning>${formatCurrency(sol.monto_solicitado)}</p>
             </div>
             <div className="w-1/2 border-l border-emerald-100 pl-4">
               <p className="text-xs uppercase font-black text-emerald-600 tracking-wider">Total a Devolver</p>
               <p className="font-black text-slate-800 text-2xl mt-1" suppressHydrationWarning>${formatCurrency(projection.montoTotalDevolver)}</p>
             </div>
           </div>
           
           <div className="flex border-b border-emerald-100 pb-4">
             <div className="w-1/2">
               <p className="text-xs uppercase font-black text-emerald-600 tracking-wider">Régimen ({sol.modalidad})</p>
               <p className="font-black text-slate-700 text-lg mt-1">{sol.cantidad_cuotas} Pagos | Disp.: {sol.tipo}</p>
             </div>
             <div className="w-1/2 border-l border-emerald-100 pl-4">
               <p className="text-xs uppercase font-black text-emerald-600 tracking-wider">Monto de Cuota</p>
               <p className="font-black text-slate-800 text-xl mt-1" suppressHydrationWarning>${formatCurrency(projection.valorCuota)}</p>
             </div>
           </div>

           <div className="flex">
             <div className="w-1/2">
               <p className="text-xs uppercase font-black text-emerald-600 tracking-wider">Fecha Entrega</p>
               <p className="font-bold text-slate-700 text-base mt-1" suppressHydrationWarning>{safeFormatDate(sol.fecha_entrega)}</p>
             </div>
             <div className="w-1/2 border-l border-emerald-100 pl-4">
               <p className="text-xs uppercase font-black text-emerald-600 tracking-wider">Día 1er Cobro</p>
               <p className="font-bold text-slate-700 text-base mt-1" suppressHydrationWarning>{safeFormatDate(sol.fecha_primer_cobro)}</p>
             </div>
           </div>
         </div>

         <p className="text-xs text-slate-500 font-medium text-center mb-5 border-t border-slate-100 pt-5">
            Tramitado Oficialmente por el Agente: <span className="font-black text-slate-700">{sol.cobrador?.nombre}</span>
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

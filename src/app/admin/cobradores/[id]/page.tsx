import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, MapPin, Phone, Briefcase, Activity, Target } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default async function CobradorHistoryPage({ params }: { params: { id: string } }) {
  const cobrador = await prisma.usuario.findUnique({
    where: { id: params.id },
    include: {
      clientesAsignados: true,
      rendiciones: {
        orderBy: { fecha: 'desc' },
        take: 30 // Ultimas 30 rendiciones
      },
      prestamos: { // Créditos entregados
        orderBy: { fecha_entrega: 'desc' },
        include: { cuotas: true }
      }
    }
  });

  if (!cobrador) return <div className="p-8 text-center text-slate-500">Cobrador no encontrado.</div>;

  // KPIs
  const clientesActivos = cobrador.clientesAsignados.length;
  const dineroPrestadoGenerado = cobrador.prestamos.reduce((acc, p) => acc + p.monto_solicitado, 0);
  
  // Total recaudado por este cobrador (en base a rendiciones)
  const montoRendidoTotal = cobrador.rendiciones.reduce((acc, r) => acc + r.monto_efectivo + r.monto_transferencias, 0);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/cobradores" className="p-2 bg-white border border-slate-200 text-slate-500 hover:text-slate-800 rounded-xl transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{cobrador.nombre}</h1>
          <p className="text-emerald-600 mt-1 font-bold text-sm uppercase tracking-wider">{cobrador.estado}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        
        {/* Contacto Info */}
        <div className="md:col-span-1 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
           <div>
             <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">DNI</p>
             <p className="font-mono text-slate-700">{cobrador.dni || 'S/N'}</p>
           </div>
           <div>
             <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 text-emerald-500 flex items-center gap-1"><Phone size={12}/> Celular</p>
             <p className="font-semibold text-slate-700">{cobrador.celular || 'S/N'}</p>
           </div>
           <div>
             <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 text-blue-500 flex items-center gap-1"><MapPin size={12}/> Dirección</p>
             <p className="font-semibold text-slate-700 text-sm leading-tight">{cobrador.direccion || 'S/N'}</p>
           </div>
        </div>

        {/* KPIs Desempeño */}
        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
           <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col justify-center">
             <Briefcase className="text-blue-500 mb-2" size={24} />
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Clientes en Cartera</p>
             <p className="text-3xl font-black text-slate-800 mt-1">{clientesActivos}</p>
           </div>

           <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col justify-center">
             <Target className="text-purple-500 mb-2" size={24} />
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Créditos Otorgados</p>
             <p className="text-3xl font-black text-slate-800 mt-1">{cobrador.prestamos.length}</p>
             <p className="text-xs text-slate-500 font-medium mt-1">Total: ${dineroPrestadoGenerado.toLocaleString('es-AR')}</p>
           </div>

           <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-5 rounded-2xl shadow-md shadow-emerald-500/20 text-white flex flex-col justify-center">
             <Activity className="text-emerald-200 mb-2" size={24} />
             <p className="text-xs font-bold text-emerald-200 uppercase tracking-widest">Historico Recaudado</p>
             <p className="text-3xl font-black text-white mt-1">${montoRendidoTotal.toLocaleString('es-AR')}</p>
           </div>
        </div>

      </div>

      {/* Recientes rendiciones */}
      <h2 className="text-xl font-bold text-slate-800 mb-4">Últimas 30 Rendiciones (Caja Diaria)</h2>
      
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[500px]">
             <thead>
               <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                 <th className="p-4">Fecha</th>
                 <th className="p-4">Estado Caja</th>
                 <th className="p-4 text-right">Efectivo</th>
                 <th className="p-4 text-right">Transferencias</th>
                 <th className="p-4 text-right font-bold text-emerald-600">Total Ingresado</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
               {cobrador.rendiciones.map((rend) => {
                 const totalDiario = rend.monto_efectivo + rend.monto_transferencias;
                 return (
                   <tr key={rend.id} className="hover:bg-slate-50 transition-colors">
                     <td className="p-4 font-semibold text-slate-700">
                       {format(new Date(rend.fecha), "EEEE, d 'de' MMMM", { locale: es })}
                     </td>
                     <td className="p-4">
                       <span className={`px-2 py-1 rounded-md text-xs font-bold ${rend.estado === 'CERRADA' ? 'bg-slate-100 text-slate-600' : 'bg-orange-100 text-orange-600'}`}>
                         {rend.estado}
                       </span>
                     </td>
                     <td className="p-4 text-right text-slate-600 font-medium">
                       ${rend.monto_efectivo.toLocaleString()}
                     </td>
                     <td className="p-4 text-right text-slate-600 font-medium">
                       ${rend.monto_transferencias.toLocaleString()}
                     </td>
                     <td className="p-4 text-right text-emerald-600 font-bold">
                       ${totalDiario.toLocaleString()}
                     </td>
                   </tr>
                 );
               })}
               {cobrador.rendiciones.length === 0 && (
                 <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">Aún no hay rendiciones de caja diarias registradas para este cobrador.</td>
                 </tr>
               )}
             </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, User, Phone, MapPin, Store, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default async function ClientHistoryPage({ params }: { params: { id: string } }) {
  const cliente = await prisma.cliente.findUnique({
    where: { id: params.id },
    include: {
      prestamos: {
        orderBy: { fecha_entrega: 'desc' },
        include: {
          cuotas: {
            orderBy: { fecha_vencimiento: 'asc' }
          }
        }
      }
    }
  });

  if (!cliente) return <div className="p-8 text-center text-slate-500">Cliente no encontrado.</div>;

  // KPIs
  const totalPrestamos = cliente.prestamos.length;
  const montosSolicitadosTotales = cliente.prestamos.reduce((acc, p) => acc + p.monto_solicitado, 0);
  
  // Cumplimiento
  let cuotasTotales = 0;
  let cuotasPagadas = 0;
  let cuotasAtrasadas = 0;

  cliente.prestamos.forEach(p => {
    p.cuotas.forEach(c => {
      cuotasTotales++;
      if (c.estado === 'PAGADO') cuotasPagadas++;
      if (c.estado === 'PENDIENTE' && c.fecha_vencimiento < new Date()) cuotasAtrasadas++;
    });
  });

  const porcentajeCumplimiento = cuotasTotales > 0 ? Math.round((cuotasPagadas / cuotasTotales) * 100) : 0;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/clientes" className="p-2 bg-white border border-slate-200 text-slate-500 hover:text-slate-800 rounded-xl transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">C. {cliente.nombre_apellido}</h1>
          <p className="text-slate-500 mt-1 font-mono text-sm">DNI: {cliente.dni}</p>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Datos Personales */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm col-span-1 md:col-span-2">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Información de Contacto</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Phone className="text-emerald-500 shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-xs text-slate-500 font-semibold mb-0.5">Celular</p>
                <p className="text-slate-700 font-medium">{cliente.celular || 'No registrado'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="text-emerald-500 shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-xs text-slate-500 font-semibold mb-0.5">Dir. Personal</p>
                <p className="text-slate-700 font-medium text-sm">{cliente.direccion_personal || 'No registrada'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Store className="text-blue-500 shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-xs text-slate-500 font-semibold mb-0.5">Negocio ({cliente.nombre_negocio || 'S/N'})</p>
                <p className="text-slate-700 font-medium text-sm">{cliente.direccion_negocio || 'No registrada'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Score de Desempeño */}
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl p-5 shadow-md shadow-emerald-500/20 text-white flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <User size={100} />
          </div>
          <h3 className="text-sm font-bold text-emerald-100 uppercase tracking-wider mb-2">Score Crediticio</h3>
          <p className="text-4xl font-black mb-1">{porcentajeCumplimiento}%</p>
          <p className="text-sm text-emerald-200 font-medium">Cumplimiento de pagos</p>
          
          <div className="mt-4 flex gap-4 text-xs font-semibold">
            <div className="bg-emerald-900/30 px-3 py-1.5 rounded-lg border border-emerald-500/30">
               {totalPrestamos} Créditos
            </div>
            <div className="bg-emerald-900/30 px-3 py-1.5 rounded-lg border border-emerald-500/30">
               {cuotasAtrasadas} Cuotas Mora
            </div>
          </div>
        </div>
      </div>

      {/* Historial de Préstamos */}
      <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
        Historial de Préstamos
        <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md text-xs font-bold">{totalPrestamos}</span>
      </h2>

      <div className="space-y-4">
        {cliente.prestamos.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 shadow-sm">
            Este cliente aún no tiene préstamos registrados.
          </div>
        ) : (
          cliente.prestamos.map((prestamo) => {
            const prestamoMora = prestamo.cuotas.some(c => c.estado === 'PENDIENTE' && c.fecha_vencimiento < new Date());
            const prestamoAlDia = prestamo.estado === 'ACTIVO' && !prestamoMora;
            const prestamoPagado = prestamo.estado === 'PAGADO';

            let tagColor = 'bg-slate-100 text-slate-600 border-slate-200';
            if (prestamoPagado) tagColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
            else if (prestamoMora) tagColor = 'bg-red-50 text-red-700 border-red-200 animate-pulse';
            else if (prestamoAlDia) tagColor = 'bg-blue-50 text-blue-700 border-blue-200';

            return (
              <div key={prestamo.id} className="bg-white border border-slate-200 rounded-2xl p-1 shadow-sm overflow-hidden">
                {/* Header Prestamo */}
                <div className="bg-slate-50 p-4 rounded-xl flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Cód: {prestamo.codigo}</p>
                    <p className="text-lg font-bold text-slate-800">${prestamo.monto_solicitado.toLocaleString('es-AR')}</p>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">
                      Entregado el {format(new Date(prestamo.fecha_entrega), "d 'de' MMMM, yyyy", { locale: es })}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border ${tagColor} inline-block mb-2`}>
                      {prestamoPagado ? 'Cancelado' : prestamoMora ? 'En Mora' : 'Activo'}
                    </span>
                    <p className="text-sm font-semibold text-slate-600">
                      {prestamo.cantidad_cuotas} cuotas de <span className="text-slate-800">${prestamo.valor_cuota.toLocaleString()}</span>
                    </p>
                  </div>
                </div>

                {/* Cuotas timeline (simple version) */}
                <div className="p-4 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                  {prestamo.cuotas.map((cuota) => {
                    let cColor = 'bg-slate-100 border-slate-200 text-slate-400';
                    let cIcon = <Clock size={14} className="opacity-50" />;
                    
                    if (cuota.estado === 'PAGADO') {
                      cColor = 'bg-emerald-50 border-emerald-200 text-emerald-600';
                      cIcon = <CheckCircle size={14} />;
                    } else if (cuota.fecha_vencimiento < new Date()) {
                      cColor = 'bg-red-50 border-red-200 text-red-600';
                      cIcon = <AlertTriangle size={14} />;
                    }

                    return (
                      <div key={cuota.id} className={`border rounded-lg p-2 flex flex-col items-center justify-center text-center ${cColor}`}>
                        <span className="text-[10px] font-bold mb-1">C. {cuota.numero_cuota}</span>
                        {cIcon}
                        <span className="text-[9px] mt-1 font-mono">{format(new Date(cuota.fecha_vencimiento), "dd/MM")}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

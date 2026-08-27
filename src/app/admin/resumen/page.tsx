import { prisma } from "@/lib/prisma";
import DashboardCharts from "./DashboardCharts";
import { TrendingUp, Users, Wallet, CreditCard, Activity, ArrowRight, Ban } from "lucide-react";
import Link from "next/link";
import { startOfMonth, startOfWeek, subMonths } from "date-fns";

export default async function ResumenPage() {
  // Global Data
  const clientes = await prisma.cliente.count();
  const cobradores = await prisma.usuario.count({ where: { rol: "COBRADOR" } });
  
  const prestamosInfo = await prisma.prestamo.aggregate({
    _sum: {
      monto_solicitado: true,
      monto_total_a_devolver: true
    },
    _count: {
      id: true
    },
    where: { estado: 'ACTIVO' }
  });

  // Calculate earnings vs loans
  const totalLent = prestamosInfo._sum.monto_solicitado || 0;
  const totalExpected = prestamosInfo._sum.monto_total_a_devolver || 0;
  const projectedProfit = totalExpected - totalLent;

  // Recent Collections
  const monthStart = startOfMonth(new Date());
  
  const rendicionesEsteMes = await prisma.cajaRendicion.aggregate({
    _sum: { monto_efectivo: true, monto_transferencias: true },
    where: { fecha: { gte: monthStart } }
  });
  
  const recaudacionMensual = (rendicionesEsteMes._sum.monto_efectivo || 0) + (rendicionesEsteMes._sum.monto_transferencias || 0);

  // Approximate historic chart data (Last 4 months for example)
  const chartData = [];
  for(let i=3; i>=0; i--) {
     const startMonth = startOfMonth(subMonths(new Date(), i));
     const endMonth = startOfMonth(subMonths(new Date(), i - 1));
     
     const mesPrestado = await prisma.prestamo.aggregate({
       _sum: { monto_solicitado: true },
       where: { fecha_entrega: { gte: startMonth, lt: endMonth } }
     });
     
     const mesCobrado = await prisma.cajaRendicion.aggregate({
       _sum: { monto_efectivo: true, monto_transferencias: true },
       where: { fecha: { gte: startMonth, lt: endMonth } }
     });

     chartData.push({
       name: startMonth.toLocaleString('es-AR', { month: 'short' }).toUpperCase(),
       Prestado: mesPrestado._sum.monto_solicitado || 0,
       Recaudado: (mesCobrado._sum.monto_efectivo || 0) + (mesCobrado._sum.monto_transferencias || 0)
     });
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Dashboard General</h1>
        <p className="text-slate-500 mt-1">Resumen financiero y métricas de operación al instante.</p>
      </div>

      {/* Hero KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-5 rounded-2xl shadow-lg shadow-emerald-500/20 text-white relative overflow-hidden">
          <Wallet className="absolute right-[-10px] bottom-[-10px] text-white opacity-10" size={100} />
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-100 flex items-center gap-2 mb-2">
            <Activity size={14} /> Recaudación del Mes
          </h3>
          <p className="text-3xl font-black">${recaudacionMensual.toLocaleString('es-AR')}</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative">
           <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-2">
             <CreditCard size={14} className="text-blue-500"/> Capital en Calle (Activo)
           </h3>
           <p className="text-3xl font-black text-slate-700">${totalLent.toLocaleString('es-AR')}</p>
           <p className="text-xs text-slate-400 mt-2 font-medium">En {prestamosInfo._count.id} préstamos activos</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative">
           <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-2">
             <TrendingUp size={14} className="text-emerald-500"/> Ganancia Proyectada
           </h3>
           <p className="text-3xl font-black text-emerald-600">${projectedProfit.toLocaleString('es-AR')}</p>
           <p className="text-xs text-slate-400 mt-2 font-medium">Intereses por cobrar futuros</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
           <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Equipo & Cartera</h3>
              <Users size={16} className="text-slate-300" />
           </div>
           <div>
             <div className="flex items-end justify-between border-b border-slate-100 pb-2 mb-2">
                <span className="text-sm font-bold text-slate-600">Clientes Inscritos</span>
                <span className="text-lg font-black text-slate-800">{clientes}</span>
             </div>
             <div className="flex items-end justify-between">
                <span className="text-sm font-bold text-slate-600">Cobradores</span>
                <span className="text-lg font-black text-slate-800">{cobradores}</span>
             </div>
           </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gráfico Principal */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            Flujo Financiero (Últimos meses)
          </h2>
          <DashboardCharts data={chartData} />
        </div>

        {/* Accesos Rápidos */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
          <h2 className="text-lg font-bold text-slate-800 mb-2">Accesos Rápidos</h2>
          
          <Link href="/admin/recaudaciones" className="group flex justify-between items-center bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 p-4 rounded-2xl transition-colors">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600"><Wallet size={20}/></div>
              <p className="font-bold text-slate-700 group-hover:text-emerald-700">Ver Recaudaciones</p>
            </div>
            <ArrowRight size={18} className="text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link href="/admin/cobradores" className="group flex justify-between items-center bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 p-4 rounded-2xl transition-colors">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-xl text-blue-600"><Users size={20}/></div>
              <p className="font-bold text-slate-700 group-hover:text-blue-700">Gestionar Cobradores</p>
            </div>
            <ArrowRight size={18} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link href="/admin/clientes" className="group flex justify-between items-center bg-slate-50 hover:bg-purple-50 border border-slate-100 hover:border-purple-200 p-4 rounded-2xl transition-colors mb-auto">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-xl text-purple-600"><TrendingUp size={20}/></div>
              <p className="font-bold text-slate-700 group-hover:text-purple-700">Directorio de Clientes</p>
            </div>
            <ArrowRight size={18} className="text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-transform" />
          </Link>

        </div>
      </div>
      
    </div>
  );
}

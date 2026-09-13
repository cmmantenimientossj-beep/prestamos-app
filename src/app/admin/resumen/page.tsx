import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { 
  ChartClientesPorDia, 
  ChartValorPrestadoPorDia, 
  ChartPrestamosPorDia, 
  ChartPagosYMontosPorDia 
} from "./DashboardCharts";
import { TrendingUp, Users, Wallet, CreditCard, Activity, CalendarDays, Briefcase, ClipboardList, ArrowRight } from "lucide-react";
import { startOfMonth, subDays, format } from "date-fns";
import { getCapitalInvertido, getGastosAllTime } from "@/actions/admin";
import { FinanzasEditors } from "./FinanzasEditors";

export const dynamic = "force-dynamic";

export default async function ResumenPage() {
  const now = new Date();
  const startOfThisMonth = startOfMonth(now);
  const thirtyDaysAgo = subDays(now, 30);

  // Global & Start of Month Data
  const clientes = await prisma.cliente.findMany({ where: { fecha_registro: { gte: thirtyDaysAgo } } });
  
  const prestamosActivos = await prisma.prestamo.findMany({ 
    where: { estado: 'ACTIVO' } 
  });
  
  const prestamosUltimos30 = await prisma.prestamo.findMany({
    where: { fecha_entrega: { gte: thirtyDaysAgo } }
  });

  const cuotasPagadasMes = await prisma.cuota.findMany({
    where: { estado: 'PAGADO', fecha_pago: { gte: startOfThisMonth } },
    include: { prestamo: true }
  });

  const cuotasPagadasUltimos30 = await prisma.cuota.findMany({
    where: { estado: 'PAGADO', fecha_pago: { gte: thirtyDaysAgo } }
  });

  // Visión General Calculations (This Month)
  let totalCapitalCobradoMes = 0;
  let totalInteresCobradoMes = 0;
  let moraCobradaMes = 0;

  for (const cuota of cuotasPagadasMes) {
    const interesPercentage = cuota.prestamo.porcentaje_interes / 100;
    const cuotasTotales = cuota.prestamo.cantidad_cuotas;
    
    // Estimate interest out of the paid quota value (simplification without amort table)
    const capOrig = cuota.prestamo.monto_solicitado / cuotasTotales;
    const intOrig = (cuota.prestamo.monto_total_a_devolver - cuota.prestamo.monto_solicitado) / cuotasTotales;
    
    totalCapitalCobradoMes += capOrig;
    totalInteresCobradoMes += intOrig;
    moraCobradaMes += cuota.interes_mora_aplicado || 0;
  }

  const gananciaPeriodo = totalInteresCobradoMes + moraCobradaMes;

  // -- NEW: HISTORICAL DATA FOR CAJA --
  const todasLasCuotasConPagos = await prisma.cuota.findMany({
    where: { monto_pagado: { gt: 0 } },
    include: { prestamo: true }
  });
  
  let capitalHistoricoDevuelto = 0;
  let interesHistoricoCobrado = 0;
  let moraHistoricaCobrada = 0;
  
  for (const cuota of todasLasCuotasConPagos) {
    const cuotasTotales = cuota.prestamo.cantidad_cuotas;
    const capOrig = cuota.prestamo.monto_solicitado / cuotasTotales;
    const intOrig = (cuota.prestamo.monto_total_a_devolver - cuota.prestamo.monto_solicitado) / cuotasTotales;
    const valorBaseCuota = capOrig + intOrig;

    let moraCobrada = 0;
    let pagoBase = cuota.monto_pagado;

    if (cuota.interes_mora_aplicado > 0) {
      if (pagoBase > valorBaseCuota) {
        moraCobrada = Math.min(pagoBase - valorBaseCuota, cuota.interes_mora_aplicado);
        pagoBase = pagoBase - moraCobrada;
      }
    }

    const fraccion = pagoBase / valorBaseCuota;
    
    capitalHistoricoDevuelto += capOrig * Math.min(fraccion, 1);
    interesHistoricoCobrado += intOrig * Math.min(fraccion, 1);
    moraHistoricaCobrada += moraCobrada;
  }
  
  const totalPrestadoAllTime = prestamosActivos.reduce((acc, p) => acc + p.monto_solicitado, 0);

  const todosLosPrestamos = await prisma.prestamo.findMany({
     select: { monto_solicitado: true }
  });
  const totalInyectadoHistorico = todosLosPrestamos.reduce((acc, p) => acc + p.monto_solicitado, 0);
  
  const circulante = totalInyectadoHistorico - capitalHistoricoDevuelto;
  const gananciasHistoricas = interesHistoricoCobrado + moraHistoricaCobrada;
  
  const capitalInvertido = await getCapitalInvertido();
  const gastosAllTime = await getGastosAllTime();
  
  const patrimonioOperativo = capitalInvertido + gananciasHistoricas - gastosAllTime;
  const enCaja = patrimonioOperativo - circulante;

  // Time-Series Data Aggregation (Last 30 Days)
  const mapData = new Map();
  for (let i = 0; i <= 30; i++) {
    const dateStr = format(subDays(now, i), 'yyyy-MM-dd');
    mapData.set(dateStr, { 
       fecha: format(subDays(now, i), 'dd/MM'),
       rawDate: dateStr,
       clientes: 0, 
       valor: 0, 
       prestamos: 0, 
       pagos: 0, 
       monto_pago: 0 
    });
  }

  clientes.forEach(c => {
    const d = format(c.fecha_registro, 'yyyy-MM-dd');
    if (mapData.has(d)) mapData.get(d).clientes += 1;
  });

  prestamosUltimos30.forEach(p => {
    const d = format(p.fecha_entrega, 'yyyy-MM-dd');
    if (mapData.has(d)) {
      mapData.get(d).valor += p.monto_solicitado;
      mapData.get(d).prestamos += 1;
    }
  });

  cuotasPagadasUltimos30.forEach(c => {
    if(!c.fecha_pago) return;
    const d = format(c.fecha_pago, 'yyyy-MM-dd');
    if (mapData.has(d)) {
      mapData.get(d).pagos += 1;
      mapData.get(d).monto_pago += c.monto_pagado;
    }
  });

  const chartData = Array.from(mapData.values()).reverse();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Dashboard & KPIs</h1>
        <p className="text-slate-500 mt-1">Métricas y tendencias de la operación financiera.</p>
      </div>
      
      <FinanzasEditors currentCapital={capitalInvertido} />

      {/* Accesos Rápidos */}
      <div className="mb-6">
        <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-slate-800"><Activity size={18} className="text-emerald-500" /> Accesos Rápidos</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/admin/solicitudes" className="group p-5 bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/10 rounded-2xl transition-all flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
                <ClipboardList size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Solicitudes</h3>
                <p className="text-xs text-slate-500">Gestionar préstamos web</p>
              </div>
            </div>
            <ArrowRight size={20} className="text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
          </Link>
        </div>
      </div>
      
      {/* Estado del Negocio Global */}
      <div className="mb-6 p-6 bg-gradient-to-br from-blue-900 to-slate-900 rounded-3xl text-white shadow-xl">
         <h2 className="text-lg font-bold flex items-center gap-2 mb-6 opacity-90"><Briefcase size={18} /> Balance Global de la Empresa (Histórico Neto)</h2>
         <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
               <span className="text-blue-300 text-[10px] font-bold uppercase tracking-widest mb-1 block">Fondo Invertido</span>
               <span className="text-xl font-bold block">${capitalInvertido.toLocaleString('es-AR', {maximumFractionDigits: 0})}</span>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-emerald-500/20">
               <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-1 block">Ganancias Históricas</span>
               <span className="text-xl font-bold block">${gananciasHistoricas.toLocaleString('es-AR', {maximumFractionDigits: 0})}</span>
            </div>
            <div className="p-4 bg-indigo-500/20 rounded-2xl border border-indigo-500/30">
               <span className="text-indigo-300 text-[10px] font-bold uppercase tracking-widest mb-1 block">Patrimonio Total</span>
               <span className="text-xl font-black block">${patrimonioOperativo.toLocaleString('es-AR', {maximumFractionDigits: 0})}</span>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl">
               <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1 block">Cap. Circulante (Calle)</span>
               <span className="text-xl font-bold block">${circulante.toLocaleString('es-AR', {maximumFractionDigits: 0})}</span>
            </div>
            <div className="p-4 bg-emerald-500/20 rounded-2xl border border-emerald-500/30">
               <span className="text-emerald-300 text-[10px] font-bold uppercase tracking-widest mb-1 block">Disponible en Caja</span>
               <span className="text-2xl font-black text-emerald-400 block">${enCaja.toLocaleString('es-AR', {maximumFractionDigits: 0})}</span>
            </div>
         </div>
      </div>

      {/* Visión General (This Month) */}
      <div className="mb-8 p-6 bg-slate-900 rounded-3xl text-white shadow-xl shadow-slate-900/10">
         <h2 className="text-lg font-bold flex items-center gap-2 mb-6 opacity-90"><CalendarDays size={18} /> Visión General (Mes Actual)</h2>
         <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            
            <div className="col-span-2 md:col-span-1 p-4 bg-emerald-500/20 rounded-2xl border border-emerald-500/30">
               <span className="text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1 block">Ganancia Periodo</span>
               <span className="text-2xl font-black text-emerald-400 block">${gananciaPeriodo.toLocaleString('es-AR', {maximumFractionDigits: 0})}</span>
            </div>

            <div className="p-4 bg-white/5 rounded-2xl">
               <span className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1 block">Total Prestado</span>
               <span className="text-xl font-bold text-white block">${totalPrestadoAllTime.toLocaleString('es-AR', {maximumFractionDigits: 0})}</span>
            </div>

            <div className="p-4 bg-white/5 rounded-2xl">
               <span className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1 block">Capital Cobrado</span>
               <span className="text-xl font-bold text-white block">${totalCapitalCobradoMes.toLocaleString('es-AR', {maximumFractionDigits: 0})}</span>
            </div>

            <div className="p-4 bg-white/5 rounded-2xl">
               <span className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1 block">Interés Cobrado</span>
               <span className="text-xl font-bold text-white block">${totalInteresCobradoMes.toLocaleString('es-AR', {maximumFractionDigits: 0})}</span>
            </div>

            <div className="p-4 bg-white/5 rounded-2xl border border-red-500/20">
               <span className="text-red-300 text-xs font-bold uppercase tracking-wider mb-1 block">Mora Cobrada</span>
               <span className="text-xl font-bold text-red-400 block">${moraCobradaMes.toLocaleString('es-AR', {maximumFractionDigits: 0})}</span>
            </div>

         </div>
      </div>

      <h2 className="text-xl font-bold text-slate-800 tracking-tight mb-4 flex items-center gap-2">
        <Activity className="text-blue-500" /> Analíticas de Operación diarios (30d)
      </h2>

      {/* Gráficos Detailed - Totalmente deslizables hacia abajo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
        
        {/* Pagos por día & Monto */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm md:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-slate-700">Cant. Pagos & Monto del pago</h3>
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl"><Wallet size={16}/></div>
          </div>
          <p className="text-xs text-slate-500">Relación entre número de cuotas cobradas y monto total recaudado.</p>
          <ChartPagosYMontosPorDia data={chartData} />
        </div>

        {/* Valor Prestado por día */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-slate-700">Valor prestado por día</h3>
            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl"><CreditCard size={16}/></div>
          </div>
          <p className="text-xs text-slate-500">Capital real inyectado al mercado cada día.</p>
          <ChartValorPrestadoPorDia data={chartData} />
        </div>

        {/* Préstamos por día */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-slate-700">Préstamos entregados</h3>
            <div className="p-2 bg-orange-100 text-orange-600 rounded-xl"><TrendingUp size={16}/></div>
          </div>
          <p className="text-xs text-slate-500">Volumen de créditos cerrados diariamente.</p>
          <ChartPrestamosPorDia data={chartData} />
        </div>

        {/* Clientes nuevos por día */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm md:col-span-2 lg:col-span-1 lg:col-start-1 lg:col-end-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-slate-700">Clientes nuevos por día</h3>
            <div className="p-2 bg-purple-100 text-purple-600 rounded-xl"><Users size={16}/></div>
          </div>
          <p className="text-xs text-slate-500">Recepción de nuevos clientes en la plataforma.</p>
          <ChartClientesPorDia data={chartData} />
        </div>

      </div>
      
    </div>
  );
}

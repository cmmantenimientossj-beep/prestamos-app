"use client";

import { useState } from "react";
import { format, isThisWeek, isThisMonth, isToday, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Filter, DollarSign, ArrowRight, ArrowDownUp, Receipt } from "lucide-react";

type RendicionType = {
  id: string;
  cobrador_id: string;
  fecha: string;
  monto_efectivo: number;
  monto_transferencias: number;
  estado: string;
  cobrador: { nombre: string };
};

export default function RecaudacionesDashboard({ 
  initialData, 
  cobradores 
}: { 
  initialData: RendicionType[], 
  cobradores: { id: string, nombre: string }[] 
}) {
  const [filterPeriod, setFilterPeriod] = useState<"TODOS" | "HOY" | "SEMANA" | "MES">("MES");
  const [filterCobrador, setFilterCobrador] = useState<string>("TODOS");

  // Filtramos la data localmente
  const filteredData = initialData.filter(rendicion => {
    // 1. Filtro por Cobrador
    if (filterCobrador !== "TODOS" && rendicion.cobrador_id !== filterCobrador) return false;

    // 2. Filtro Temporal
    const date = parseISO(rendicion.fecha);
    if (filterPeriod === "HOY" && !isToday(date)) return false;
    if (filterPeriod === "SEMANA" && !isThisWeek(date, { weekStartsOn: 1 })) return false;
    if (filterPeriod === "MES" && !isThisMonth(date)) return false;
    
    return true;
  });

  // KPIs
  const totalEfectivo = filteredData.reduce((acc, current) => acc + current.monto_efectivo, 0);
  const totalTransferencias = filteredData.reduce((acc, current) => acc + current.monto_transferencias, 0);
  const granTotal = totalEfectivo + totalTransferencias;

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Recaudaciones</h1>
          <p className="text-slate-500 mt-1">Supervisa el flujo de caja ingresado por los cobradores</p>
        </div>
        
        {/* Controles de Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto p-2 bg-slate-100 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
            <Filter size={16} className="text-emerald-600" />
            <select 
              value={filterPeriod} 
              onChange={(e) => setFilterPeriod(e.target.value as any)}
              className="bg-transparent text-sm font-semibold text-slate-700 focus:outline-none"
            >
              <option value="HOY">Solo Hoy</option>
              <option value="SEMANA">Esta Semana</option>
              <option value="MES">Este Mes</option>
              <option value="TODOS">Histórico Total</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
            <select 
              value={filterCobrador} 
              onChange={(e) => setFilterCobrador(e.target.value)}
              className="bg-transparent text-sm font-semibold text-slate-700 focus:outline-none"
            >
              <option value="TODOS">Todos los cobradores</option>
              {cobradores.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tarjetas de Metricas (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 rounded-3xl shadow-lg shadow-emerald-500/20 text-white flex flex-col justify-between relative overflow-hidden">
           <DollarSign className="absolute top-4 right-4 opacity-20" size={80} />
           <p className="text-emerald-100 font-bold uppercase tracking-wider text-xs mb-2">Total Recaudado</p>
           <h2 className="text-4xl font-black">${granTotal.toLocaleString('es-AR')}</h2>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
           <p className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-2 flex items-center gap-2">
             <Receipt size={16} className="text-emerald-500" /> Efectivo en Mano
           </p>
           <h2 className="text-3xl font-black text-slate-700">${totalEfectivo.toLocaleString('es-AR')}</h2>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
           <p className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-2 flex items-center gap-2">
             <ArrowDownUp size={16} className="text-blue-500" /> Transferencias Bancarias
           </p>
           <h2 className="text-3xl font-black text-slate-700">${totalTransferencias.toLocaleString('es-AR')}</h2>
        </div>
      </div>

      {/* Lista del flujo */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
           <h3 className="font-bold text-slate-700">Desglose de Rendiciones</h3>
           <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold">{filteredData.length} Registros</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 text-xs uppercase tracking-wider font-bold">
                <th className="p-4">Fecha de Cierre</th>
                <th className="p-4">Cobrador</th>
                <th className="p-4 text-right">Efectivo Ingresado</th>
                <th className="p-4 text-right">Bancarizado</th>
                <th className="p-4 text-right">Rendido</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((rend) => {
                const totalCaja = rend.monto_efectivo + rend.monto_transferencias;
                return (
                  <tr key={rend.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4">
                      <p className="font-bold text-slate-700">
                        {format(parseISO(rend.fecha), "EEEE, d 'de' MMMM", { locale: es })}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{format(parseISO(rend.fecha), "HH:mm")}</p>
                    </td>
                    <td className="p-4 font-semibold text-slate-600">
                      {rend.cobrador.nombre}
                    </td>
                    <td className="p-4 text-right font-medium text-slate-500">
                      ${rend.monto_efectivo.toLocaleString()}
                    </td>
                    <td className="p-4 text-right font-medium text-slate-500">
                      ${rend.monto_transferencias.toLocaleString()}
                    </td>
                    <td className="p-4 text-right">
                       <span className="font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg flex justify-center items-center gap-1 w-full max-w-[120px] ml-auto">
                         ${totalCaja.toLocaleString()}
                       </span>
                    </td>
                  </tr>
                );
              })}
              {filteredData.length === 0 && (
                <tr>
                   <td colSpan={5} className="p-10 text-center text-slate-500 font-medium">No se encontraron movimientos financieros con los filtros actuales.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

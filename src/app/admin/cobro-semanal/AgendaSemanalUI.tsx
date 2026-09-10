"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, CheckCircle2, AlertCircle, Clock, User } from "lucide-react";
import { getDay, isValid } from "date-fns";

export default function AgendaSemanalUI({ cuotas, cobradores }: { cuotas: any[], cobradores: any[] }) {
  const [collectorFilter, setCollectorFilter] = useState<string>("todos");

  // Calculate stats for the progress bar
  const totalCuotas = cuotas.length;
  const pagadas = cuotas.filter(c => c.estado === 'PAGADA' || c.estado === 'COMPLETADO' || c.monto_pagado >= c.valor).length;
  const pendientes = cuotas.filter(c => c.estado === 'PENDIENTE' || c.estado === 'MORA');
  
  const percentage = totalCuotas > 0 ? Math.round((pagadas / totalCuotas) * 100) : 0;
  const montoEsperado = cuotas.reduce((acc, c) => acc + c.valor, 0);
  const montoCobrado = cuotas.reduce((acc, c) => acc + c.monto_pagado, 0);

  // Apply collector filter to pending quotas
  const filteredPendientes = pendientes.filter(c => {
    if (collectorFilter === "todos") return true;
    return c.prestamo.cobrador.id === collectorFilter;
  });

  // Group by day of week
  const groupedByDay: { [key: number]: any[] } = {
    1: [], // Lunes
    2: [], // Martes
    3: [], // Miércoles
    4: [], // Jueves
    5: [], // Viernes
    6: [], // Sábado
  };

  filteredPendientes.forEach(c => {
    const date = new Date(c.fecha_vencimiento);
    if (isValid(date)) {
      const day = getDay(date); // 0 = Domingo, 1 = Lunes, ... 6 = Sábado
      if (groupedByDay[day]) {
        groupedByDay[day].push(c);
      }
    }
  });

  const dayNames: { [key: number]: string } = {
    1: "Lunes", 2: "Martes", 3: "Miércoles", 4: "Jueves", 5: "Viernes", 6: "Sábado"
  };

  return (
    <div className="pb-10 relative z-40">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
            <CalendarIcon className="text-emerald-500" size={32} />
            Agenda Semanal de Cobros
          </h1>
          <p className="text-slate-500 mt-1">Supervisa qué cuentas faltan cobrar en la semana (Lunes a Sábado)</p>
        </div>

        <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl shadow-sm w-full md:w-auto">
          <User size={18} className="text-slate-400" />
          <select 
            value={collectorFilter}
            onChange={(e) => setCollectorFilter(e.target.value)}
            className="bg-transparent focus:outline-none text-slate-700 font-semibold w-full md:w-48 appearance-none cursor-pointer"
          >
            <option value="todos">Todos los cobradores</option>
            {cobradores.map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Progress Bar Module */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm mb-8">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-700">Rendimiento de la Semana</h2>
            <p className="text-sm text-slate-500">Avance de los cobros efectivos sobre el total proyectado</p>
          </div>
          <div className="text-right">
             <p className="text-3xl font-black text-emerald-600">{percentage}%</p>
          </div>
        </div>
        
        <div className="w-full bg-slate-100 rounded-full h-4 mb-4 overflow-hidden shadow-inner">
          <div className="bg-emerald-500 h-4 rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 border-t border-slate-100 pt-6">
          <div>
             <p className="text-xs uppercase font-bold text-slate-400 tracking-widest">Cuotas Pagadas</p>
             <p className="text-xl font-bold text-slate-800 flex items-center gap-2"><CheckCircle2 size={20} className="text-emerald-500"/> {pagadas} <span className="text-sm font-normal text-slate-500">de {totalCuotas}</span></p>
          </div>
          <div>
             <p className="text-xs uppercase font-bold text-slate-400 tracking-widest">Esperado / Cobrado</p>
             <p className="text-xl font-bold text-slate-800">${montoEsperado} / <span className="text-emerald-600">${montoCobrado}</span></p>
          </div>
          <div>
             <p className="text-xs uppercase font-bold text-slate-400 tracking-widest">Pendientes</p>
             <p className="text-xl font-bold text-slate-800 flex items-center gap-2"><Clock size={20} className="text-amber-500"/> {pendientes.length} Restantes</p>
          </div>
        </div>
      </div>

      {/* Agenda por Días */}
      <div className="space-y-6">
        {[1, 2, 3, 4, 5, 6].map(day => {
          const cuotasDelDia = groupedByDay[day];
          
          if (cuotasDelDia.length === 0) return null; // No mostrar días vacíos

          return (
            <div key={day} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                 <h3 className="font-bold text-lg text-slate-800 uppercase tracking-widest">{dayNames[day]}</h3>
                 <span className="bg-white border border-slate-200 text-slate-600 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                   {cuotasDelDia.length} Trabajos
                 </span>
              </div>
              <div className="divide-y divide-slate-100">
                {cuotasDelDia.map(c => (
                  <div key={c.id} className="p-4 px-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                     <div className="flex-1">
                       <p className="font-bold text-lg text-slate-800">{c.prestamo.cliente.nombre_apellido}</p>
                       <div className="text-sm text-slate-500 flex flex-wrap gap-x-4 mt-1">
                         <span>📞 {c.prestamo.cliente.celular || 'S/N'}</span>
                         <span className="truncate max-w-[200px]" title={c.prestamo.cliente.direccion_personal}>📍 {c.prestamo.cliente.direccion_personal}</span>
                       </div>
                     </div>
                     <div className="flex-1 md:text-center shrink-0">
                       <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">A Cobrar</p>
                       <p className="font-black text-2xl text-slate-800">${c.valor}</p>
                     </div>
                     <div className="flex-1 md:text-right flex flex-col items-start md:items-end shrink-0">
                       <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Asignado a</p>
                       <p className="font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 mt-1">
                         {c.prestamo.cobrador.nombre}
                       </p>
                     </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {filteredPendientes.length === 0 && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-12 text-center text-emerald-700 shadow-sm flex flex-col items-center">
            <CheckCircle2 size={48} className="text-emerald-500 mb-4" />
            <h3 className="text-xl font-bold">¡Días Limpios!</h3>
            <p className="opacity-80 mt-2">No hay cuotas pendientes para mostrar en la agenda.</p>
          </div>
        )}
      </div>
    
    </div>
  );
}

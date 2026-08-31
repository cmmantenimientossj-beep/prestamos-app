import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, User, Phone, MapPin, Store, DollarSign, Wallet, TrendingUp } from "lucide-react";
import ClientProfileTabs from "./ClientProfileTabs";
import CrmControls from "./CrmControls";
import PrintStatement from "./PrintStatement";

export default async function ClientHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cliente = await prisma.cliente.findUnique({
    where: { id },
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

  if (!cliente) return <div className="p-8 text-center text-slate-500 font-bold">Cliente no encontrado en la base de datos maestra.</div>;

  // Analítica de Radar Financiero
  const totalPrestamos = cliente.prestamos.length;
  
  let capitalInyectado = 0;
  let deudaActiva = 0;
  let capitalRecuperado = 0;
  
  let cuotasTotales = 0;
  let cuotasPagadas = 0;
  let cuotasAtrasadas = 0;

  cliente.prestamos.forEach(p => {
    capitalInyectado += p.monto_solicitado;
    
    p.cuotas.forEach(c => {
      cuotasTotales++;
      if (c.estado === 'PAGADO') {
         cuotasPagadas++;
         capitalRecuperado += c.monto_pagado || c.valor;
      }
      if (c.estado === 'PENDIENTE') {
         deudaActiva += c.valor;
         if (c.fecha_vencimiento < new Date()) {
            cuotasAtrasadas++;
         }
      }
    });
  });

  const porcentajeCumplimiento = cuotasTotales > 0 ? Math.round((cuotasPagadas / cuotasTotales) * 100) : 0;
  
  // Score de Confianza
  let scoreText = "Excelente";
  let scoreColor = "from-emerald-500 to-emerald-700 shadow-emerald-500/20";
  let scoreIcon = "bg-emerald-900/30 text-emerald-100 border-emerald-500/30";

  if (cuotasAtrasadas > 0 && cuotasAtrasadas <= 2) {
     scoreText = "Bueno (Con leves atrasos)";
     scoreColor = "from-blue-500 to-blue-700 shadow-blue-500/20";
     scoreIcon = "bg-blue-900/30 text-blue-100 border-blue-500/30";
  } else if (cuotasAtrasadas >= 3 && cuotasAtrasadas <= 5) {
     scoreText = "Regular / Riesgoso";
     scoreColor = "from-orange-500 to-orange-700 shadow-orange-500/20";
     scoreIcon = "bg-orange-900/30 text-orange-100 border-orange-500/30";
  } else if (cuotasAtrasadas > 5) {
     scoreText = "Peligroso (Mora Alta)";
     scoreColor = "from-red-500 to-red-800 shadow-red-500/20";
     scoreIcon = "bg-red-900/40 text-red-100 border-red-500/30";
  }
  
  if (totalPrestamos === 0) {
     scoreText = "Sin Historial";
     scoreColor = "from-slate-400 to-slate-600 shadow-slate-500/20";
     scoreIcon = "bg-slate-900/30 text-slate-100 border-slate-500/30";
  }

  const wApp = cliente.celular ? `https://wa.me/${cliente.celular}` : "#";

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/clientes" className="p-3 bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-2xl transition-colors shadow-sm">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-tight uppercase flex items-center gap-2">
              {cliente.nombre_apellido}
              <a href={wApp} target="_blank" rel="noreferrer" className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] uppercase font-black cursor-pointer hover:bg-emerald-200 transition-colors">
                WhatsApp
              </a>
            </h1>
            <p className="text-slate-500 mt-1 font-mono text-sm tracking-wide">DNI: {cliente.dni}</p>
          </div>
        </div>
        
        {/* Acciones */}
        <div className="w-full sm:w-auto min-w-[240px]">
           <PrintStatement 
              clienteNombre={cliente.nombre_apellido}
              clienteDni={cliente.dni}
              porcentajeCumplimiento={porcentajeCumplimiento}
              totalPrestamos={totalPrestamos}
              deudaActiva={deudaActiva}
           />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Identidad & CRM */}
        <div className="flex flex-col gap-6 col-span-1">
           <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm flex flex-col justify-between">
             <div>
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5"><User size={14}/> Perfil Legal</h3>
               <div className="space-y-4">
                 <div className="flex items-start gap-3">
                   <MapPin className="text-blue-500 shrink-0 mt-0.5" size={18} />
                   <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Casa</p>
                     <p className="text-slate-700 font-bold text-sm">{cliente.direccion_personal || 'N/A'}</p>
                   </div>
                 </div>
                 <div className="flex items-start gap-3">
                   <Store className="text-amber-500 shrink-0 mt-0.5" size={18} />
                   <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Negocio ({cliente.nombre_negocio || 'N/A'})</p>
                     <p className="text-slate-700 font-bold text-sm">{cliente.direccion_negocio || 'N/A'}</p>
                   </div>
                 </div>
               </div>
             </div>
             <div className="mt-8 pt-6 border-t border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cobradores Asignados</p>
                <p className="text-slate-700 font-semibold text-sm">Automático por Ruta</p>
             </div>
           </div>
           
           {/* Módulo Interactivo CRM */}
           <CrmControls 
             clienteId={cliente.id} 
             initialNotas={cliente.notas_internas} 
             initialCalificacion={cliente.calificacion} 
           />
        </div>

        {/* Score & Radar Financiero */}
        <div className="col-span-1 lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
           {/* Score Box */}
           <div className={`bg-gradient-to-br ${scoreColor} rounded-[2rem] p-6 shadow-lg text-white flex flex-col justify-between relative overflow-hidden`}>
             <div className="absolute -top-10 -right-10 p-4 opacity-10">
               <TrendingUp size={160} />
             </div>
             <div>
               <h3 className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-2">Score de Confianza</h3>
               <p className="text-4xl font-black mb-1">{porcentajeCumplimiento}%</p>
               <p className="text-sm font-bold opacity-90">{scoreText}</p>
             </div>
             
             <div className="mt-6 flex flex-wrap gap-2 text-[10px] uppercase tracking-wider font-black">
               <div className={`px-3 py-1.5 rounded-xl border ${scoreIcon}`}>
                  {totalPrestamos} Crédito(s) Base
               </div>
               {cuotasAtrasadas > 0 && (
                 <div className={`px-3 py-1.5 rounded-xl border ${scoreIcon}`}>
                    {cuotasAtrasadas} Cuotas Atrasadas Totales
                 </div>
               )}
             </div>
           </div>
           
           {/* Radar Finanzas */}
           <div className="bg-slate-800 rounded-[2rem] p-6 shadow-lg shadow-slate-800/10 text-white flex flex-col justify-between relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
               <Wallet size={120} />
             </div>
             <div>
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5"><DollarSign size={14}/> Radar Financiero Global</h3>
               
               <div className="space-y-4">
                 <div>
                   <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Capital Emitido (Histórico)</p>
                   <p className="text-2xl font-black text-emerald-400">${capitalInyectado.toLocaleString('es-AR')}</p>
                 </div>
                 <div className="flex gap-4 border-t border-slate-700/50 pt-4">
                    <div className="w-1/2">
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider line-clamp-1">Recuperado</p>
                      <p className="text-lg font-bold text-slate-200">${capitalRecuperado.toLocaleString('es-AR')}</p>
                    </div>
                    <div className="w-1/2 border-l border-slate-700/50 pl-4">
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider line-clamp-1">Deuda Viva</p>
                      <p className="text-lg font-bold text-slate-200">${deudaActiva.toLocaleString('es-AR')}</p>
                    </div>
                 </div>
               </div>
             </div>
           </div>
        </div>
      </div>

      {/* Historial de Préstamos */}
      <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        Expedientes de Préstamo
      </h2>

      <ClientProfileTabs prestamos={cliente.prestamos} />
    </div>
  );
}

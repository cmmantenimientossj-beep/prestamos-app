"use client";

import { useState } from "react";
import PrestamoResumenCard from "@/components/PrestamoResumenCard";
import { Search } from "lucide-react";

export default function HistorialFeed({ initialPrestamos }: { initialPrestamos: any[] }) {
  const [search, setSearch] = useState("");
  
  const filtered = initialPrestamos.filter(p => 
    p.cliente.nombre_apellido.toLowerCase().includes(search.toLowerCase()) ||
    p.codigo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          <Search size={20} />
        </span>
        <input 
          type="text" 
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por cliente o código..." 
          className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-medium text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        />
      </div>

      <div className="space-y-4 pb-10 flex flex-col items-center">
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-slate-400 font-medium text-sm">
            {search ? "No hay resultados de búsqueda." : "No tienes préstamos emitidos todavía."}
          </div>
        ) : (
          filtered.map(p => (
            <PrestamoResumenCard 
              key={p.id}
              clienteNombre={p.cliente.nombre_apellido}
              clienteDireccion={p.cliente.direccion_negocio || p.cliente.direccion_personal || "Sin dirección"}
              montoPrestado={p.monto_solicitado}
              montoTotalDevolver={p.monto_total_a_devolver}
              valorCuota={p.valor_cuota}
              cantidadCuotas={p.cantidad_cuotas}
              fechaEntrega={p.fecha_entrega}
              tipo={p.tipo}
              modalidad={p.modalidad}
              codigo={p.codigo}
            />
          ))
        )}
      </div>
    </div>
  );
}

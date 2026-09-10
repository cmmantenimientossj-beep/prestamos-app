"use client";

import { useState, useTransition } from "react";
import { Search, Plus, Download, Edit, Trash2, X, Eye } from "lucide-react";
import { createCliente, deleteCliente } from "@/actions/clientes";
import Link from "next/link";

export default function ClientManager({ initialClientes }: { initialClientes: any[] }) {
  const [clientes, setClientes] = useState(initialClientes);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"todos" | "con-credito-activo" | "sin-credito-activo" | "inactivos">("todos");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Create form state
  const [nombre, setNombre] = useState("");
  const [dni, setDni] = useState("");
  const [celular, setCelular] = useState("");
  const [direccionPersonal, setDireccionPersonal] = useState("");
  const [direccionNegocio, setDireccionNegocio] = useState("");
  const [nombreNegocio, setNombreNegocio] = useState("");

  const filteredClientes = clientes.filter(c => {
    const matchesSearch = c.nombre_apellido.toLowerCase().includes(searchTerm.toLowerCase()) || c.dni.includes(searchTerm);
    if (!matchesSearch) return false;

    const hasActive = c.prestamos && c.prestamos.length > 0;
    const totalLoans = c._count?.prestamos || 0;

    if (filterStatus === "con-credito-activo") return hasActive;
    if (filterStatus === "sin-credito-activo") return !hasActive && totalLoans > 0;
    if (filterStatus === "inactivos") return totalLoans === 0;
    
    return true; // todos
  });

  const handleDelete = async (id: string, nombre: string) => {
    if (!window.confirm(`¿Seguro que deseas eliminar a ${nombre}?`)) return;
    
    startTransition(async () => {
      const res = await deleteCliente(id);
      if (res.success) {
        alert("Cliente eliminado.");
        setClientes(clientes.filter(c => c.id !== id));
      } else {
        alert(res.error);
      }
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await createCliente({
        nombre_apellido: nombre,
        dni,
        celular,
        direccion_personal: direccionPersonal,
        direccion_negocio: direccionNegocio,
        nombre_negocio: nombreNegocio
      });

      if (res.success) {
        setIsModalOpen(false);
        window.location.reload(); 
      } else {
        alert(res.error);
      }
    });
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 relative z-40">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Directorio de Clientes</h1>
          <p className="text-slate-500 mt-1">Gestiona los clientes y su historial crediticio</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl border border-slate-200 transition-colors shadow-sm pointer-events-auto">
            <Download size={18} />
            <span>Exportar</span>
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl transition-colors shadow-md shadow-emerald-600/20 font-medium pointer-events-auto cursor-pointer"
          >
            <Plus size={18} />
            <span>Alta de Cliente</span>
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 w-full relative z-40 pointer-events-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
        <style>{`
          .flex.gap-2.mb-6.overflow-x-auto::-webkit-scrollbar { display: none; }
        `}</style>
        <button 
          onClick={() => setFilterStatus("todos")}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap flex-shrink-0 pointer-events-auto cursor-pointer ${filterStatus === "todos" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}
        >
          Todos
        </button>
        <button 
          onClick={() => setFilterStatus("con-credito-activo")}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap flex-shrink-0 pointer-events-auto cursor-pointer ${filterStatus === "con-credito-activo" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}
        >
          Con crédito activo
        </button>
        <button 
          onClick={() => setFilterStatus("sin-credito-activo")}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap flex-shrink-0 pointer-events-auto cursor-pointer ${filterStatus === "sin-credito-activo" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}
        >
          Sin crédito activo
        </button>
        <button 
          onClick={() => setFilterStatus("inactivos")}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap flex-shrink-0 pointer-events-auto cursor-pointer ${filterStatus === "inactivos" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}
        >
          Inactivos
        </button>
      </div>

      <div className="bg-white border border-slate-200 p-4 rounded-2xl mb-6 flex gap-4 shadow-sm relative z-40 pointer-events-auto">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar en el historial por nombre o DNI..." 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="flex flex-col gap-4 relative z-40 pointer-events-auto">
        {filteredClientes.map((client) => {
          const isMora = client.prestamos?.some((p: any) => p.estado === 'MORA');
          const hasActive = client.prestamos && client.prestamos.length > 0;
          const status = isMora ? 'Mora' : (hasActive ? 'Al día' : 'Cerrado');

          return (
            <div 
              key={client.id} 
              className="bg-sky-50 border border-sky-100 hover:bg-sky-100 hover:border-sky-200 rounded-3xl p-5 shadow-sm transition-all group flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6 justify-between"
            >
              {/* Cliente */}
              <div className="flex-1 min-w-[200px]">
                <p className="font-bold text-slate-800 text-lg">{client.nombre_apellido}</p>
                <p className="text-sm text-slate-500 font-mono mt-0.5">DNI: {client.dni}</p>
              </div>

              {/* Contacto */}
              <div className="flex-1 bg-white/70 px-4 py-2.5 rounded-2xl border border-sky-50/50 text-sm shadow-sm md:shadow-none">
                <p className="text-[10px] uppercase font-bold tracking-widest text-sky-500 mb-0.5">Contacto</p>
                <p className="font-bold text-slate-700">{client.celular || 'Sin celular'}</p>
                <p className="text-xs text-slate-500 truncate max-w-[200px] mt-0.5" title={client.direccion_personal}>{client.direccion_personal || 'Sin dir. personal'}</p>
              </div>

              {/* Negocio */}
              <div className="flex-1 bg-white/70 px-4 py-2.5 rounded-2xl border border-sky-50/50 text-sm shadow-sm md:shadow-none">
                <p className="text-[10px] uppercase font-bold tracking-widest text-sky-500 mb-0.5">Negocio</p>
                <p className="font-bold text-slate-700">{client.nombre_negocio || 'Particular'}</p>
                <p className="text-xs text-slate-500 truncate max-w-[200px] mt-0.5" title={client.direccion_negocio}>{client.direccion_negocio || 'Sin dir. comercial'}</p>
              </div>

              {/* Estado */}
              <div className="flex flex-row lg:flex-col items-center justify-between lg:items-center gap-3 lg:gap-2">
                 <p className="text-xs font-semibold flex items-center gap-1.5 bg-white px-4 py-2 rounded-full border border-sky-100 shadow-sm w-fit">
                   <span className={`w-2.5 h-2.5 rounded-full ${status === 'Al día' ? 'bg-emerald-500' : status === 'Mora' ? 'bg-red-500 animate-pulse' : 'bg-slate-400'}`}></span>
                   <span className={status === 'Mora' ? 'text-red-600' : status === 'Al día' ? 'text-emerald-700' : 'text-slate-500'}>{status}</span>
                 </p>
                 <span className="bg-white text-sky-700 px-3 py-1.5 rounded-full border border-sky-100 text-[10px] font-bold uppercase tracking-wider shadow-sm w-fit whitespace-nowrap">
                   {client._count.prestamos} Préstamos
                 </span>
              </div>

              {/* Historial (Acciones) */}
              <div className="flex justify-end lg:justify-center gap-3 mt-2 lg:mt-0 pt-3 lg:pt-0 border-t border-sky-100/50 lg:border-none">
                <Link 
                  href={`/admin/clientes/${client.id}`}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-all flex items-center gap-2 font-bold text-sm shadow-lg shadow-blue-500/30 w-full lg:w-auto justify-center"
                >
                  <Eye size={18} /> Ver Historial
                </Link>
                <button 
                  onClick={() => handleDelete(client.id, client.nombre_apellido)}
                  className="p-3 bg-white text-slate-400 hover:bg-red-50 hover:text-red-600 border border-sky-50 rounded-full transition-colors flex items-center justify-center shadow-sm"
                  title="Eliminar Cliente"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          );
        })}
        {filteredClientes.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm flex flex-col items-center gap-3">
             <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-2">
                <Search size={28} />
             </div>
             <h3 className="text-lg font-bold text-slate-700">No se encontraron clientes</h3>
             <p className="text-slate-500 text-sm">Usa el buscador o registra un nuevo cliente en el botón superior.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsModalOpen(false)} className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full p-1.5 transition-colors"><X size={20} /></button>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Cargar Nuevo Cliente</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nombre y Apellido</label>
                  <input required type="text" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">DNI</label>
                  <input required type="text" value={dni} onChange={e => setDni(e.target.value)} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Número celular</label>
                <input required type="tel" value={celular} onChange={e => setCelular(e.target.value)} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" placeholder="Ej: 341 555 5555" />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Domicilio Personal</label>
                <input required type="text" value={direccionPersonal} onChange={e => setDireccionPersonal(e.target.value)} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
              </div>

              <div className="border-t border-slate-100 pt-4 mt-2">
                <h3 className="text-sm font-bold text-slate-700 mb-3">Datos Comerciales (Opcional)</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nombre del Negocio</label>
                    <input type="text" value={nombreNegocio} onChange={e => setNombreNegocio(e.target.value)} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" placeholder="Ej: Kiosco El Sol" />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Domicilio Comercial</label>
                    <input type="text" value={direccionNegocio} onChange={e => setDireccionNegocio(e.target.value)} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
                  </div>
                </div>
              </div>

              <button disabled={isPending} type="submit" className="w-full mt-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl disabled:opacity-50 shadow-md shadow-emerald-500/20 transition-all">
                {isPending ? 'Guardando...' : 'Cargar Cliente'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

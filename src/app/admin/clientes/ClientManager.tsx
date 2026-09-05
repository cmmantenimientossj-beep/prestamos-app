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

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm relative z-40 pointer-events-auto">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-500 text-sm uppercase tracking-wider font-semibold">
                <th className="p-4">Cliente / DNI</th>
                <th className="p-4">Contacto</th>
                <th className="p-4">Negocio</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right">Historial</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClientes.map((client) => {
                const isMora = client.prestamos?.some((p: any) => p.estado === 'MORA');
                const hasActive = client.prestamos && client.prestamos.length > 0;
                const status = isMora ? 'Mora' : (hasActive ? 'Al día' : 'Cerrado');

                return (
                  <tr key={client.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4">
                      <p className="font-bold text-slate-800 text-base">{client.nombre_apellido}</p>
                      <p className="text-xs text-slate-500 mt-1 font-mono">{client.dni}</p>
                    </td>
                    <td className="p-4 text-slate-600 text-sm">
                      <p>{client.celular || 'Sin celular'}</p>
                      <p className="text-xs text-slate-400 truncate max-w-[150px]">{client.direccion_personal || 'Sin dir. personal'}</p>
                    </td>
                    <td className="p-4 text-slate-600 text-sm">
                      <p className="font-medium">{client.nombre_negocio || 'Particular'}</p>
                      <p className="text-xs text-slate-400 truncate max-w-[150px]">{client.direccion_negocio || 'Sin dir. comercial'}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1 items-start">
                         <p className="text-xs font-semibold flex items-center gap-1.5">
                           <span className={`w-2 h-2 rounded-full ${status === 'Al día' ? 'bg-emerald-500' : status === 'Mora' ? 'bg-red-500 animate-pulse' : 'bg-slate-400'}`}></span>
                           <span className={status === 'Mora' ? 'text-red-600' : status === 'Al día' ? 'text-emerald-700' : 'text-slate-500'}>{status}</span>
                         </p>
                         <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">
                           {client._count.prestamos} Préstamos
                         </span>
                      </div>
                    </td>
                    <td className="p-4 text-right align-middle">
                      <div className="flex justify-end gap-2">
                        <Link 
                          href={`/admin/clientes/${client.id}`}
                          className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 rounded-lg transition-colors flex items-center gap-1.5 font-semibold text-xs border border-blue-100 shadow-sm"
                        >
                          <Eye size={16} /> Ver
                        </Link>
                        <button 
                          onClick={() => handleDelete(client.id, client.nombre_apellido)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar Cliente"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredClientes.length === 0 && (
                <tr>
                   <td colSpan={5} className="p-8 text-center text-slate-500">No se encontraron clientes. Usa el buscador o registra uno nuevo.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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

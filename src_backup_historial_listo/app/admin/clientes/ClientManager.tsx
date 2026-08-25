"use client";

import { useState, useTransition } from "react";
import { Search, Plus, Download, Edit, Trash2, X } from "lucide-react";
import { createCliente, deleteCliente } from "@/actions/clientes";

export default function ClientManager({ initialClientes }: { initialClientes: any[] }) {
  const [clientes, setClientes] = useState(initialClientes);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Create form state
  const [nombre, setNombre] = useState("");
  const [dni, setDni] = useState("");
  const [celular, setCelular] = useState("");

  const filteredClientes = clientes.filter(c => 
    c.nombre_apellido.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.dni.includes(searchTerm)
  );

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
        celular
      });

      if (res.success) {
        setIsModalOpen(false);
        // Refresh full page to get new _count aggregations safely
        window.location.reload(); 
      } else {
        alert(res.error);
      }
    });
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Directorio de Clientes</h1>
          <p className="text-neutral-400 mt-1">Gestiona los deudores y métricas individuales</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2.5 rounded-xl border border-neutral-700 transition-colors">
            <Download size={18} />
            <span>Exportar</span>
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-emerald-900/20"
          >
            <Plus size={18} />
            <span>Nuevo Cliente</span>
          </button>
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={20} />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre o DNI..." 
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl shadow-black/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-neutral-950/80 border-b border-neutral-800 text-neutral-400 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">Cliente</th>
                <th className="p-4 font-semibold">DNI</th>
                <th className="p-4 font-semibold">Contacto</th>
                <th className="p-4 font-semibold">Estado</th>
                <th className="p-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50">
              {filteredClientes.map((client) => {
                const isMora = client.prestamos && client.prestamos.length > 0;
                const status = isMora ? 'Mora' : (client._count.prestamos > 0 ? 'Al día' : 'Cerrado');

                return (
                  <tr key={client.id} className="hover:bg-neutral-800/30 transition-colors group">
                    <td className="p-4">
                      <p className="font-semibold text-white text-base">{client.nombre_apellido}</p>
                      <p className="text-xs text-neutral-500 mt-1 flex items-center gap-1.5 font-medium">
                        <span className={`w-2 h-2 rounded-full ${status === 'Al día' ? 'bg-emerald-500' : status === 'Mora' ? 'bg-red-500 animate-pulse' : 'bg-neutral-500'}`}></span>
                        {status}
                      </p>
                    </td>
                    <td className="p-4 text-neutral-300 font-mono text-sm">{client.dni}</td>
                    <td className="p-4 text-neutral-300 text-sm tracking-wide">{client.celular || 'N/A'}</td>
                    <td className="p-4">
                      <span className="bg-neutral-950 text-neutral-300 px-3 py-1.5 rounded-lg text-xs font-semibold border border-neutral-800">
                        {client._count.prestamos} Activos
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-emerald-400 hover:text-white hover:bg-emerald-600/20 rounded-lg transition-colors">
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(client.id, client.nombre_apellido)}
                          className="p-2 text-red-400 hover:text-white hover:bg-red-600/20 rounded-lg transition-colors"
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
                   <td colSpan={5} className="p-8 text-center text-neutral-500">No se encontraron clientes.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute right-6 top-6 text-neutral-400 hover:text-white"><X size={20} /></button>
            <h2 className="text-xl font-bold text-white mb-6">Nuevo Cliente</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Nombre Completo</label>
                <input required type="text" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full mt-1 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wide">DNI</label>
                <input required type="text" value={dni} onChange={e => setDni(e.target.value)} className="w-full mt-1 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Celular</label>
                <input type="text" value={celular} onChange={e => setCelular(e.target.value)} className="w-full mt-1 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500" />
              </div>
              <button disabled={isPending} type="submit" className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl disabled:opacity-50">
                {isPending ? 'Guardando...' : 'Crear Perfil'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

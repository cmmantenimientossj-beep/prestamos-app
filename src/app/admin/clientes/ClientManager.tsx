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
    const confirmacion = window.confirm(`¡CUIDADO! Estás a punto de eliminar al cliente ${nombre}.\n\nEsta acción también borrará TODOS sus préstamos (activos e inactivos), solicitudes y cuotas asociadas (Desaparecerá todo su registro). Es IRREVERSIBLE.\n\n¿Estás completamente seguro de continuar?`);
    if (!confirmacion) return;

    const codigo = window.prompt("Por seguridad, ingresa el PIN maestro para autorizar la eliminación:");
    if (codigo !== "2510") {
      alert("PIN incorrecto. Operación cancelada.");
      return;
    }
    
    startTransition(async () => {
      const res = await deleteCliente(id, codigo);
      if (res.success) {
        alert("El cliente y todo su historial han sido eliminados por completo.");
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

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm relative z-40 pointer-events-auto p-4">
        <div className="overflow-x-auto">
          <div className="min-w-[850px] flex flex-col gap-3 py-2">
            
            {/* Encabezado */}
            <div className="flex text-slate-500 text-sm uppercase tracking-wider font-semibold px-8 mb-2">
               <div className="w-[30%]">Cliente / DNI</div>
               <div className="w-[20%]">Contacto</div>
               <div className="w-[20%]">Negocio</div>
               <div className="w-[15%]">Estado</div>
               <div className="w-[15%] text-right pr-6">Acción</div>
            </div>

            {/* Filas en forma de píldora azul */}
            {filteredClientes.map((client) => {
              const isMora = client.prestamos?.some((p: any) => p.estado === 'MORA');
              const hasActive = client.prestamos && client.prestamos.length > 0;
              const status = isMora ? 'Mora' : (hasActive ? 'Al día' : 'Cerrado');

              return (
                <div 
                  key={client.id} 
                  className="flex items-center bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-full px-6 py-2.5 shadow-md shadow-cyan-900/10 hover:shadow-lg hover:scale-[1.01] transition-all cursor-pointer group"
                >
                  {/* Cliente */}
                  <div className="w-[30%] pr-4 border-r border-white/20">
                    <p className="font-bold text-base drop-shadow-sm line-clamp-1">{client.nombre_apellido}</p>
                    <p className="text-xs text-blue-100 font-mono mt-0.5">{client.dni}</p>
                  </div>

                  {/* Contacto */}
                  <div className="w-[20%] px-4 border-r border-white/20">
                    <p className="font-semibold text-sm drop-shadow-sm line-clamp-1">{client.celular || 'Sin celular'}</p>
                    <p className="text-xs text-blue-100 truncate mt-0.5" title={client.direccion_personal}>{client.direccion_personal || 'Sin dir. personal'}</p>
                  </div>

                  {/* Negocio */}
                  <div className="w-[20%] px-4 border-r border-white/20">
                    <p className="font-semibold text-sm drop-shadow-sm line-clamp-1">{client.nombre_negocio || 'Particular'}</p>
                    <p className="text-xs text-blue-100 truncate mt-0.5" title={client.direccion_negocio}>{client.direccion_negocio || 'Sin dir. comercial'}</p>
                  </div>

                  {/* Estado */}
                  <div className="w-[15%] px-4">
                    <div className="flex flex-col gap-1 items-start">
                       <p className="text-xs font-semibold flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full w-fit">
                         <span className={`w-2 h-2 rounded-full ${status === 'Al día' ? 'bg-emerald-400' : status === 'Mora' ? 'bg-red-400 animate-pulse' : 'bg-slate-300'}`}></span>
                         <span>{status}</span>
                       </p>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="w-[15%] pl-4 flex justify-end items-center gap-2 pr-1">
                    <Link 
                      href={`/admin/clientes/${client.id}`}
                      className="px-4 py-1.5 bg-white text-blue-600 hover:bg-slate-50 hover:text-blue-700 rounded-full transition-colors font-bold text-xs shadow-sm flex items-center justify-center flex-1 max-w-[90px]"
                    >
                      VER
                    </Link>
                    <button 
                      onClick={() => handleDelete(client.id, client.nombre_apellido)}
                      className="p-1.5 text-blue-100 hover:text-red-300 hover:bg-white/10 rounded-full transition-colors"
                      title="Eliminar Cliente"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
            
            {filteredClientes.length === 0 && (
              <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-2xl w-full">
                 No se encontraron clientes. Usa el buscador o registra uno nuevo.
              </div>
            )}
          </div>
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

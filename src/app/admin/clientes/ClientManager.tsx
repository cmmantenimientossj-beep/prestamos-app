"use client";

import { useState, useTransition } from "react";
import { Search, Plus, Download, Edit, Trash2, X, Eye } from "lucide-react";
import { createCliente, deleteCliente } from "@/actions/clientes";
import Link from "next/link";

export default function ClientManager({ initialClientes }: { initialClientes: any[] }) {
  const [clientes, setClientes] = useState(initialClientes);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"todos" | "al-dia" | "con-atraso" | "en-mora" | "sin-deuda">("todos");
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
    const matchesSearch = c.nombre_apellido.toLowerCase().includes(searchTerm.toLowerCase()) || (c.dni && c.dni.includes(searchTerm));
    if (!matchesSearch) return false;

    const status = c.estadoFinanciero || (c.prestamos?.some((p: any) => p.estado === 'MORA') ? 'EN_MORA' : c.prestamos && c.prestamos.length > 0 ? 'AL_DIA' : 'SIN_DEUDA');

    if (filterStatus === "al-dia") return status === "AL_DIA";
    if (filterStatus === "con-atraso") return status === "CON_ATRASO";
    if (filterStatus === "en-mora") return status === "EN_MORA";
    if (filterStatus === "sin-deuda") return status === "SIN_DEUDA";
    
    return true; // todos
  });

  // Conteo para insignias de filtros
  const countAlDia = clientes.filter(c => (c.estadoFinanciero || (c.prestamos && c.prestamos.length > 0 && !c.prestamos?.some((p: any) => p.estado === 'MORA') ? 'AL_DIA' : '')) === 'AL_DIA').length;
  const countAtraso = clientes.filter(c => c.estadoFinanciero === 'CON_ATRASO').length;
  const countMora = clientes.filter(c => (c.estadoFinanciero === 'EN_MORA' || (!c.estadoFinanciero && c.prestamos?.some((p: any) => p.estado === 'MORA')))).length;
  const countSinDeuda = clientes.filter(c => (c.estadoFinanciero === 'SIN_DEUDA' || (!c.estadoFinanciero && (!c.prestamos || c.prestamos.length === 0)))).length;

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
          <p className="text-slate-500 mt-1">Accede a las fichas de clientes y visualiza su estado crediticio</p>
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

      {/* Filtros de Estado */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 w-full relative z-40 pointer-events-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
        <style>{`
          .flex.gap-2.mb-6.overflow-x-auto::-webkit-scrollbar { display: none; }
        `}</style>
        <button 
          onClick={() => setFilterStatus("todos")}
          className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex-shrink-0 pointer-events-auto cursor-pointer ${filterStatus === "todos" ? "bg-slate-800 text-white shadow-md" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}
        >
          Todos ({clientes.length})
        </button>
        <button 
          onClick={() => setFilterStatus("al-dia")}
          className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex-shrink-0 pointer-events-auto cursor-pointer flex items-center gap-1.5 ${filterStatus === "al-dia" ? "bg-emerald-700 text-white shadow-md shadow-emerald-700/20" : "bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50"}`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Al día ({countAlDia})</span>
        </button>
        <button 
          onClick={() => setFilterStatus("con-atraso")}
          className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex-shrink-0 pointer-events-auto cursor-pointer flex items-center gap-1.5 ${filterStatus === "con-atraso" ? "bg-amber-600 text-white shadow-md shadow-amber-600/20" : "bg-white text-amber-700 border border-amber-200 hover:bg-amber-50"}`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          <span>Con atraso ({countAtraso})</span>
        </button>
        <button 
          onClick={() => setFilterStatus("en-mora")}
          className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex-shrink-0 pointer-events-auto cursor-pointer flex items-center gap-1.5 ${filterStatus === "en-mora" ? "bg-red-700 text-white shadow-md shadow-red-700/20" : "bg-white text-red-700 border border-red-200 hover:bg-red-50"}`}
        >
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          <span>En mora ({countMora})</span>
        </button>
        <button 
          onClick={() => setFilterStatus("sin-deuda")}
          className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex-shrink-0 pointer-events-auto cursor-pointer flex items-center gap-1.5 ${filterStatus === "sin-deuda" ? "bg-slate-600 text-white shadow-md" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"}`}
        >
          <span className="w-2 h-2 rounded-full bg-slate-400"></span>
          <span>Sin deuda ({countSinDeuda})</span>
        </button>
      </div>

      {/* Buscador */}
      <div className="bg-white border border-slate-200 p-3 rounded-2xl mb-6 flex gap-4 shadow-sm relative z-40 pointer-events-auto">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar cliente por nombre o DNI..." 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-slate-800 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Grilla de Botones Tipo Píldora con Efecto Vidrio Esmerilado Gris */}
      <div className="relative z-40 pointer-events-auto mb-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filteredClientes.map((client) => {
            const status = client.estadoFinanciero || (client.prestamos?.some((p: any) => p.estado === 'MORA') ? 'EN_MORA' : client.prestamos && client.prestamos.length > 0 ? 'AL_DIA' : 'SIN_DEUDA');

            let statusLabel = "Al día";
            let statusBadge = "bg-emerald-500/10 text-emerald-800 border-emerald-500/30";
            let statusDot = "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]";

            if (status === "CON_ATRASO") {
              statusLabel = "Con atraso";
              statusBadge = "bg-amber-500/10 text-amber-800 border-amber-500/30";
              statusDot = "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.7)]";
            } else if (status === "EN_MORA") {
              statusLabel = "En mora";
              statusBadge = "bg-red-500/10 text-red-800 border-red-500/30";
              statusDot = "bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.7)]";
            } else if (status === "SIN_DEUDA") {
              statusLabel = "Sin deuda";
              statusBadge = "bg-slate-500/10 text-slate-600 border-slate-400/30";
              statusDot = "bg-slate-400";
            }

            return (
              <div key={client.id} className="relative group">
                <Link 
                  href={`/admin/clientes/${client.id}`}
                  className="w-full flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-3xl backdrop-blur-md bg-slate-200/50 hover:bg-slate-300/60 border border-slate-300/70 hover:border-slate-400 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer text-center min-h-[92px]"
                  title={`Ver ficha de ${client.nombre_apellido}`}
                >
                  {/* Nombre del Cliente */}
                  <p className="font-bold text-xs sm:text-sm text-slate-800 group-hover:text-slate-950 transition-colors line-clamp-1 w-full px-1 uppercase tracking-tight">
                    {client.nombre_apellido}
                  </p>

                  {/* Estado en botón píldora pequeño debajo */}
                  <div className="mt-2 flex items-center justify-center">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold border backdrop-blur-xs shadow-xs ${statusBadge}`}>
                      <span className={`w-2 h-2 rounded-full ${statusDot}`} />
                      <span>{statusLabel}</span>
                    </span>
                  </div>
                </Link>

                {/* Botón discreto de eliminación protegido contra clics accidentales */}
                <button 
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDelete(client.id, client.nombre_apellido);
                  }}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                  title={`Eliminar cliente ${client.nombre_apellido}`}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })}
        </div>

        {filteredClientes.length === 0 && (
          <div className="p-10 text-center text-slate-500 bg-white border border-slate-200 rounded-3xl shadow-sm w-full">
             No se encontraron clientes con el criterio seleccionado. Usa el buscador o da de alta uno nuevo.
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

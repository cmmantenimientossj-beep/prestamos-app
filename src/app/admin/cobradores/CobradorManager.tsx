"use client";

import { useState, useTransition } from "react";
import { Search, Plus, Eye, Ban, CheckCircle } from "lucide-react";
import { createCobrador, toggleCobradorStatus } from "@/actions/cobradores";
import Link from "next/link";
import { X } from "lucide-react";

export default function CobradorManager({ initialCobradores }: { initialCobradores: any[] }) {
  const [cobradores, setCobradores] = useState(initialCobradores);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Create form state
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dni, setDni] = useState("");
  const [celular, setCelular] = useState("");
  const [direccion, setDireccion] = useState("");

  const filteredCobradores = cobradores.filter(c => 
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.dni && c.dni.includes(searchTerm))
  );

  const handleToggleStatus = async (id: string, nombre: string, currentStatus: string) => {
    const actionStr = currentStatus === 'ACTIVO' ? 'inhabilitar' : 'habilitar';
    if (!window.confirm(`¿Seguro que deseas ${actionStr} a ${nombre}?`)) return;
    
    startTransition(async () => {
      const res = await toggleCobradorStatus(id, currentStatus);
      if (res.success) {
        setCobradores(cobradores.map(c => c.id === id ? { ...c, estado: res.newStatus } : c));
      } else {
        alert(res.error);
      }
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await createCobrador({
        nombre,
        email,
        password_hash: password,
        dni,
        celular,
        direccion
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Gestión de Cobradores</h1>
          <p className="text-slate-500 mt-1">Administra tu equipo de calle y supervisa su rendimiento</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl transition-colors shadow-md shadow-emerald-600/20 font-medium"
        >
          <Plus size={18} />
          <span>Alta de Cobrador</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 p-4 rounded-2xl mb-6 flex gap-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, email o DNI..." 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-500 text-sm uppercase tracking-wider font-semibold">
                <th className="p-4">Cobrador</th>
                <th className="p-4">Contacto</th>
                <th className="p-4">Cartera Asignada</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right">Desempeño</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCobradores.map((cobrador) => {
                const isActivo = cobrador.estado === 'ACTIVO';

                return (
                  <tr key={cobrador.id} className={`transition-colors group ${isActivo ? 'hover:bg-slate-50' : 'bg-slate-50/50 opacity-75'}`}>
                    <td className="p-4 text-sm">
                      <p className="font-bold text-slate-800 text-base">{cobrador.nombre}</p>
                      <p className="text-xs text-slate-500 mt-1 font-mono">{cobrador.dni || 'Sin DNI'} • {cobrador.email}</p>
                    </td>
                    <td className="p-4 text-slate-600 text-sm">
                      <p className="font-medium">{cobrador.celular || 'S/N'}</p>
                      <p className="text-xs text-slate-400 truncate max-w-[150px]">{cobrador.direccion || 'Sin dirección'}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2 items-center">
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">
                          {cobrador._count.clientesAsignados} Clientes
                        </span>
                        <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">
                          {cobrador._count.prestamos} Créditos
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                       <p className="text-xs font-semibold flex items-center gap-1.5">
                         <span className={`w-2 h-2 rounded-full ${isActivo ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                         <span className={isActivo ? 'text-emerald-700' : 'text-red-700'}>{cobrador.estado}</span>
                       </p>
                    </td>
                    <td className="p-4 text-right align-middle">
                      <div className="flex justify-end gap-2">
                        <Link 
                          href={`/admin/cobradores/${cobrador.id}`}
                          className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 rounded-lg transition-colors flex items-center gap-1.5 font-semibold text-xs border border-blue-100 shadow-sm"
                        >
                          <Eye size={16} /> Ver historial
                        </Link>
                        <button 
                          onClick={() => handleToggleStatus(cobrador.id, cobrador.nombre, cobrador.estado)}
                          className={`p-2 rounded-lg transition-colors flex items-center justify-center ${isActivo ? 'text-orange-500 hover:text-orange-700 hover:bg-orange-50' : 'text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50'}`}
                          title={isActivo ? "Inhabilitar" : "Reactivar"}
                        >
                          {isActivo ? <Ban size={18} /> : <CheckCircle size={18} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredCobradores.length === 0 && (
                <tr>
                   <td colSpan={5} className="p-8 text-center text-slate-500">No se encontraron cobradores.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsModalOpen(false)} className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full p-1.5 transition-colors"><X size={20} /></button>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Nuevo Cobrador</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nombre Completo</label>
                  <input required type="text" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">DNI</label>
                  <input required type="text" value={dni} onChange={e => setDni(e.target.value)} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Número celular</label>
                <input required type="tel" value={celular} onChange={e => setCelular(e.target.value)} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Dirección (Domicilio)</label>
                <input required type="text" value={direccion} onChange={e => setDireccion(e.target.value)} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
              </div>

              <div className="border-t border-slate-100 pt-4 mt-2">
                <h3 className="text-sm font-bold text-slate-700 mb-3">Datos de Ingreso (App)</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Email (Usuario)</label>
                    <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" placeholder="cobrador@ryb.com" />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Contraseña</label>
                    <input required type="text" value={password} onChange={e => setPassword(e.target.value)} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" placeholder="Asigna una contraseña segura" />
                  </div>
                </div>
              </div>

              <button disabled={isPending} type="submit" className="w-full mt-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl disabled:opacity-50 shadow-md shadow-emerald-500/20 transition-all">
                {isPending ? 'Guardando...' : 'Crear Perfil del Cobrador'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

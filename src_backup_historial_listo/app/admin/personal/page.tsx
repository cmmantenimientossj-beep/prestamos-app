import { Search, Plus, UserX, UserCheck, Shield } from "lucide-react";

export default function PersonalPage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Gestión de Personal</h1>
          <p className="text-neutral-400 mt-1">Alta, bajas y reasignación de carteras para cobradores</p>
        </div>
        <button className="w-full md:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl transition-colors shadow-lg shadow-emerald-900/20">
          <Plus size={18} />
          <span className="font-medium">Nuevo Cobrador</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl shadow-black/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-neutral-950/80 border-b border-neutral-800 text-neutral-400 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">Personal</th>
                <th className="p-4 font-semibold">Rol</th>
                <th className="p-4 font-semibold">Estado de Cuenta</th>
                <th className="p-4 font-semibold">Cartera Asignada</th>
                <th className="p-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50">
              {[
                { name: "Alberto Gómez", email: "alberto.gomez@ryb.com", role: "COBRADOR", status: "ACTIVO", clients: 145 },
                { name: "María Vargas", email: "maria.vargas@ryb.com", role: "COBRADOR", status: "ACTIVO", clients: 89 },
                { name: "Carlos López", email: "carlos.lopez@ryb.com", role: "COBRADOR", status: "SUSPENDIDO", clients: 0 },
                { name: "Admin Principal", email: "admin@ryb.com", role: "ADMIN", status: "ACTIVO", clients: "-" },
              ].map((user, i) => (
                <tr key={i} className="hover:bg-neutral-800/30 transition-colors group">
                  <td className="p-4">
                    <p className="font-semibold text-white text-base">{user.name}</p>
                    <p className="text-xs text-neutral-500 mt-1 font-medium">{user.email}</p>
                  </td>
                  <td className="p-4">
                    {user.role === 'ADMIN' ? (
                      <span className="inline-flex items-center gap-1.5 bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-lg text-xs font-bold border border-indigo-500/20">
                        <Shield size={14} /> ADMIN
                      </span>
                    ) : (
                      <span className="inline-block bg-neutral-800 text-neutral-300 px-3 py-1 rounded-lg text-xs font-bold border border-neutral-700">
                        COBRADOR
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    {user.status === 'ACTIVO' ? (
                      <span className="inline-block bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-bold border border-emerald-500/20">
                        ACTIVO
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 bg-red-500/10 text-red-400 px-3 py-1.5 rounded-lg text-xs font-bold border border-red-500/20">
                        SUSPENDIDO
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    {user.clients !== '-' ? (
                      <span className="bg-neutral-950 text-neutral-300 px-4 py-1.5 rounded-lg text-sm font-semibold border border-neutral-800">
                        {user.clients} clientes
                      </span>
                    ) : '-'}
                  </td>
                  <td className="p-4 text-right">
                    {user.role !== 'ADMIN' && (
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="text-xs font-bold uppercase tracking-wider bg-neutral-950 border border-neutral-700/50 px-3 py-2 rounded-lg hover:bg-neutral-800 hover:border-neutral-600 text-white transition-colors inset-shadow-sm">
                          Reasignar Cartera
                        </button>
                        {user.status === 'ACTIVO' ? (
                           <button className="p-2 text-red-400 hover:text-white hover:bg-red-600/20 rounded-lg transition-colors border border-transparent hover:border-red-500/30">
                             <UserX size={18} />
                           </button>
                        ) : (
                           <button className="p-2 text-emerald-400 hover:text-white hover:bg-emerald-600/20 rounded-lg transition-colors border border-transparent hover:border-emerald-500/30">
                             <UserCheck size={18} />
                           </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

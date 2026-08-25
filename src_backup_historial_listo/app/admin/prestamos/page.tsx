import { Search, Plus, Filter, AlertCircle } from "lucide-react";

export default function PrestamosPage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Gestión de Préstamos</h1>
          <p className="text-neutral-400 mt-1">Supervisa créditos activos, refinancia o carga quitas especiales</p>
        </div>
        <button className="w-full md:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-emerald-900/20">
          <Plus size={18} />
          <span>Otorgar Crédito Directo</span>
        </button>
      </div>

      {/* Tabs and Filters */}
      <div className="flex flex-col xl:flex-row gap-4 mb-6">
        <div className="flex bg-neutral-900 p-1 rounded-xl border border-neutral-800 w-full xl:w-fit overflow-x-auto whitespace-nowrap">
          <button className="px-6 py-2 bg-neutral-800 text-white shadow-sm rounded-lg text-sm font-medium transition-all">Todos</button>
          <button className="px-6 py-2 text-neutral-400 hover:text-white rounded-lg text-sm font-medium transition-all">Activos</button>
          <button className="px-6 py-2 text-red-400/80 hover:text-red-400 rounded-lg text-sm font-medium transition-all">En Mora</button>
          <button className="px-6 py-2 text-neutral-400 hover:text-white rounded-lg text-sm font-medium transition-all">Finalizados</button>
        </div>
        
        <div className="flex gap-4 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por código de crédito o DNI de cliente..." 
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          <button className="flex items-center justify-center bg-neutral-900 px-4 py-2.5 border border-neutral-800 rounded-xl hover:bg-neutral-800 transition-colors text-neutral-400 hover:text-white">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl shadow-black/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-neutral-950/80 border-b border-neutral-800 text-neutral-400 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">Cod. Préstamo</th>
                <th className="p-4 font-semibold">Cliente</th>
                <th className="p-4 font-semibold">Monto / A Devolver</th>
                <th className="p-4 font-semibold">Cuotas</th>
                <th className="p-4 font-semibold">Estado</th>
                <th className="p-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50">
              {[
                { id: "PR-10023", client: "Juan Carlos Miranda", amount: "$50,000", total: "$75,000 (50%)", quotas: "4/30 (Diaria)", status: "ACTIVO" },
                { id: "PR-10022", client: "Ana Laura Torres", amount: "$20,000", total: "$26,000 (30%)", quotas: "0/4 (Semanal)", status: "MORA" },
              ].map((loan, i) => (
                <tr key={i} className="hover:bg-neutral-800/30 transition-colors group">
                  <td className="p-4 font-mono font-bold text-emerald-400 text-sm">{loan.id}</td>
                  <td className="p-4 font-semibold text-white">{loan.client}</td>
                  <td className="p-4">
                    <p className="text-white font-medium">{loan.amount}</p>
                    <p className="text-xs text-neutral-400 font-medium mt-0.5">{loan.total}</p>
                  </td>
                  <td className="p-4 text-neutral-300 text-sm tracking-wide">{loan.quotas}</td>
                  <td className="p-4">
                    {loan.status === 'ACTIVO' && (
                      <span className="inline-block bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-bold border border-emerald-500/20 shadow-sm shadow-emerald-900/10">
                        ACTIVO
                      </span>
                    )}
                    {loan.status === 'MORA' && (
                      <span className="inline-flex items-center gap-1.5 bg-red-500/10 text-red-400 px-3 py-1.5 rounded-lg text-xs font-bold border border-red-500/20 shadow-sm shadow-red-900/10 animate-pulse">
                        <AlertCircle size={14} /> MORA
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                     <button className="text-xs font-bold uppercase tracking-wider bg-neutral-950 border border-neutral-700/50 px-4 py-2 rounded-lg hover:bg-neutral-800 hover:border-neutral-600 text-white transition-colors inset-shadow-sm opacity-0 group-hover:opacity-100">
                       Ver / Refinanciar
                     </button>
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

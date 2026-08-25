import { ArrowUpRight, ArrowDownRight, DollarSign, Users, Activity } from "lucide-react";
import { getDashboardMetrics } from "@/actions/admin";

export default async function AdminDashboardPage() {
  const metrics = await getDashboardMetrics();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Panel Principal</h1>
          <p className="text-neutral-400 mt-1">Resumen financiero y estado de cobros (En Tiempo Real)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Metric 1 */}
        <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-neutral-400 mb-1">Capital Activo (En calle)</p>
              <h2 className="text-3xl font-bold text-white">${metrics.capitalActivo.toLocaleString()}</h2>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <DollarSign size={24} />
            </div>
          </div>
          <p className="text-sm text-emerald-400 mt-4 flex items-center gap-1 font-medium">
            <ArrowUpRight size={16} /> En cuotas vigentes
          </p>
        </div>

        {/* Metric 2 */}
        <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-neutral-400 mb-1">Total Clientes Activos</p>
              <h2 className="text-3xl font-bold text-white">{metrics.clientesActivos}</h2>
            </div>
            <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl">
              <Users size={24} />
            </div>
          </div>
          <p className="text-sm text-cyan-400 mt-4 flex items-center gap-1 font-medium">
            <ArrowUpRight size={16} /> Con créditos pendientes
          </p>
        </div>

        {/* Metric 3 */}
        <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-neutral-400 mb-1">Índice de Morosidad</p>
              <h2 className="text-3xl font-bold text-white">{metrics.morosidad}%</h2>
            </div>
            <div className="p-3 bg-red-500/10 text-red-400 rounded-xl">
              <Activity size={24} />
            </div>
          </div>
          <p className="text-sm text-red-400 mt-4 flex items-center gap-1 font-medium">
            <ArrowDownRight size={16} /> Promedio general
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart Placeholder Area */}
        <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800">
          <h3 className="text-lg font-semibold mb-6 flex justify-between items-center">
            Progreso de Cobros
            <span className="text-xs bg-neutral-800 py-1 px-3 rounded-full text-neutral-300">Hoy</span>
          </h3>
          <div className="flex h-48 justify-center items-center rounded-xl bg-neutral-950/50 border border-dashed border-neutral-800">
            <p className="text-neutral-500 text-sm">Espacio para gráfico de Recharts (Líneas)</p>
          </div>
        </div>
        
        {/* Recent Transactions List */}
        <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Rendiciones Recientes</h3>
            <button className="text-sm text-emerald-400 hover:text-emerald-300">Ver todas</button>
          </div>
          
          <div className="space-y-4">
            {metrics.rendiciones.length === 0 ? (
              <p className="text-neutral-500 text-sm text-center py-4">No hay rendiciones recientes registradas en la base de datos.</p>
            ) : (
              metrics.rendiciones.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-4 bg-neutral-950 rounded-xl border border-neutral-800/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-neutral-400">
                      {item.cobrador.nombre.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-white">{item.cobrador.nombre}</p>
                      <p className="text-xs text-neutral-500">{new Date(item.fecha).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-400">+${(item.monto_efectivo + item.monto_transferencias).toLocaleString()}</p>
                    <p className="text-xs text-neutral-500">{item.estado}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

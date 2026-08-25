import { CheckCircle2, Banknote, Landmark, Navigation } from "lucide-react";

export default function ResumenCajaPage() {
  return (
    <div className="animate-in fade-in zoom-in-95 duration-300">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Rendición de Caja</h2>
        <p className="text-slate-500 text-sm mt-0.5">Estado actual de la caja diaria</p>
      </div>

      {/* Main Totals */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-[2rem] text-white shadow-xl shadow-slate-900/20 mb-6 relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl"></div>
        <p className="text-sm text-slate-400 font-bold uppercase tracking-wider mb-1">Total a Rendir Hoy</p>
        <h2 className="text-5xl font-black mb-6 tracking-tight">$85,400</h2>
        
        <div className="grid grid-cols-2 gap-4 border-t border-slate-700/80 pt-5">
          <div>
            <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mb-1">
              <Banknote size={14} className="text-emerald-400" /> Efectivo
            </p>
            <p className="text-xl font-bold text-white">$60,400</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mb-1">
              <Landmark size={14} className="text-cyan-400" /> Transf.
            </p>
            <p className="text-xl font-bold text-white">$25,000</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-3xl">
          <div className="w-10 h-10 bg-emerald-200/50 rounded-full flex items-center justify-center text-emerald-600 mb-3">
             <CheckCircle2 size={20} strokeWidth={2.5} />
          </div>
          <p className="text-sm font-black text-slate-700">42 Cuotas</p>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Cobradas hoy</p>
        </div>
        
        <div className="bg-amber-50 border border-amber-100 p-4 rounded-3xl">
          <div className="w-10 h-10 bg-amber-200/50 rounded-full flex items-center justify-center text-amber-600 mb-3">
             <Navigation size={20} strokeWidth={2.5} className="rotate-45" />
          </div>
          <p className="text-sm font-black text-slate-700">8 Pendientes</p>
          <p className="text-xs text-slate-500 font-medium mt-0.5">De visita</p>
        </div>
      </div>

      {/* Caja Operations */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="font-black text-slate-800 mb-4">Cierre de Jornada</h3>
        
        <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl mb-4 border border-slate-100">
          <span className="text-sm font-bold text-slate-600">Préstamos Emitidos</span>
          <span className="font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-md">-$20,000</span>
        </div>

        <button className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-black text-lg py-4 rounded-2xl shadow-lg shadow-slate-900/20 active:scale-95 transition-all flex justify-center items-center gap-2">
          Enviar Rendición
        </button>
        <p className="text-center text-xs text-slate-400 font-medium mt-4 px-4 leading-relaxed">
          Al enviar la rendición, el administrador recibirá una notificación para auditar la caja.
        </p>
      </div>

    </div>
  );
}

import { ReactNode } from "react";
import Link from "next/link";
import { Home, PlusCircle, Map, LogOut, Wallet } from "lucide-react";

export default function CobradorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Mobile Top App Bar */}
      <header className="bg-emerald-600 text-white p-4 shadow-md sticky top-0 z-30 flex justify-between items-center rounded-b-2xl">
        <div className="flex items-center gap-2">
          <Wallet size={24} className="opacity-90" />
          <h1 className="font-bold text-xl tracking-tight">Ruta RYB</h1>
        </div>
        <button className="p-2 bg-emerald-700/60 rounded-full hover:bg-emerald-800/80 transition-colors">
          <LogOut size={18} />
        </button>
      </header>

      {/* Main Scrollable Content */}
      <main className="flex-1 overflow-y-auto p-4 pb-28">
        {children}
      </main>

      {/* Floating Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-slate-100 shadow-[0_-15px_30px_-5px_rgba(0,0,0,0.08)] flex justify-around p-3 pb-6 z-40 rounded-t-[2rem]">
        <Link href="/mis-rutas" className="flex flex-col items-center px-4 py-2 text-emerald-600">
          <Map size={24} />
          <span className="text-[10px] uppercase font-bold tracking-wider mt-1.5 opacity-90">Hoja Ruta</span>
        </Link>
        
        {/* Floating Action Button */}
        <Link href="/nuevo-prestamo" className="relative flex flex-col justify-center items-center -mt-10 bg-emerald-500 hover:bg-emerald-400 outline outline-8 outline-slate-50 text-white p-4 rounded-full shadow-xl shadow-emerald-500/30 transition-transform active:scale-95">
          <PlusCircle size={32} />
        </Link>

        <Link href="/resumen" className="flex flex-col items-center px-4 py-2 text-slate-400 hover:text-emerald-600 transition-colors">
          <Home size={24} />
          <span className="text-[10px] uppercase font-bold tracking-wider mt-1.5 opacity-90">Caja</span>
        </Link>
      </nav>
    </div>
  );
}

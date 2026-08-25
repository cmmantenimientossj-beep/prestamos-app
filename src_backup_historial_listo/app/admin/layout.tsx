import { ReactNode } from "react";
import Link from "next/link";
import { LayoutDashboard, Users, CreditCard, Activity, LogOut } from "lucide-react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-neutral-900 text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-neutral-950 p-6 flex flex-col justify-between hidden md:flex border-r border-neutral-800">
        <div>
          <div className="mb-8">
            <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500">
              RYB
            </h1>
            <p className="text-neutral-500 text-xs font-semibold uppercase tracking-widest mt-1">SaaS Financiero</p>
          </div>
          <nav className="space-y-2">
            <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 bg-emerald-500/10 text-emerald-400 rounded-xl transition-all">
              <LayoutDashboard size={20} />
              <span className="font-medium">Dashboard</span>
            </Link>
            <Link href="/admin/clientes" className="flex items-center gap-3 px-4 py-3 text-neutral-400 hover:bg-neutral-800/50 hover:text-white rounded-xl transition-all">
              <Users size={20} />
              <span className="font-medium">Clientes</span>
            </Link>
            <Link href="/admin/prestamos" className="flex items-center gap-3 px-4 py-3 text-neutral-400 hover:bg-neutral-800/50 hover:text-white rounded-xl transition-all">
              <CreditCard size={20} />
              <span className="font-medium">Préstamos</span>
            </Link>
            <Link href="/admin/finanzas" className="flex items-center gap-3 px-4 py-3 text-neutral-400 hover:bg-neutral-800/50 hover:text-white rounded-xl transition-all">
              <Activity size={20} />
              <span className="font-medium">Reportes</span>
            </Link>
          </nav>
        </div>
        <button className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-950/30 rounded-xl transition-all w-full mt-8">
          <LogOut size={20} />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

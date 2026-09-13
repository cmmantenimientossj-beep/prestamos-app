"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, UserCog, DollarSign, LogOut, ClipboardList } from "lucide-react";
import { signOut } from "next-auth/react";
import LoanSimulator from "@/components/LoanSimulator";

export default function ClientLayout({ children, notificationBell }: { children: ReactNode, notificationBell: ReactNode }) {
  const pathname = usePathname();

  const links = [
    { name: "Dashboard", href: "/admin/resumen", icon: LayoutDashboard },
    { name: "Clientes", href: "/admin/clientes", icon: Users },
    { name: "Cobradores", href: "/admin/cobradores", icon: UserCog },
    { name: "Agenda", href: "/admin/cobro-semanal", icon: ClipboardList },
    { name: "Recaudaciones", href: "/admin/recaudaciones", icon: DollarSign },
  ];

  const handleLogout = async () => {
    await signOut({ redirect: false });
    window.location.href = '/login';
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="w-64 bg-white p-6 justify-between hidden md:flex flex-col border-r border-slate-200 relative z-50 shadow-[4px_0_24px_-10px_rgba(0,0,0,0.1)]">
        <div>
          <div className="mb-8">
            <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-emerald-700">
              RYB
            </h1>
            <p className="text-emerald-800/60 text-xs font-semibold uppercase tracking-widest mt-1">Admin Panel</p>
          </div>
          <nav className="space-y-2">
            {links.map((link) => {
              const isActive = pathname?.startsWith(link.href);
              return (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-emerald-100 text-emerald-700 font-bold' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
                >
                  <link.icon size={20} />
                  <span className="font-medium">{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="mt-8 flex gap-2">
          <div className="bg-slate-100 rounded-xl flex items-center justify-center p-2 relative z-50">
            {notificationBell}
          </div>
          <button 
            onClick={handleLogout}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
            title="Cerrar sesión"
          >
            <LogOut size={20} />
            <span className="font-medium hidden lg:inline">Salir</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header (only on mobile) */}
      <header className="md:hidden bg-emerald-600 text-white p-4 shadow-md sticky top-0 z-50 flex justify-between items-center rounded-b-2xl relative">
        <h1 className="font-bold text-xl tracking-tight">RYB Admin</h1>
        <div className="flex gap-2 items-center relative z-50">
           {notificationBell}
           <button 
             onClick={handleLogout}
             className="p-2 bg-emerald-700/60 rounded-full hover:bg-emerald-800/80 transition-colors pointer-events-auto"
             title="Cerrar sesión"
           >
             <LogOut size={18} />
           </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50">
        <div className="max-w-7xl mx-auto min-h-full flex flex-col">
          <div className="flex-1">
            {children}
          </div>
          {/* Explicit spacer for mobile bottom navigation to ensure last element is fully visible */}
          <div className="h-[140px] shrink-0 w-full md:hidden"></div>
        </div>
      </main>

      {/* Mobile Floating Bottom Navigation (only on mobile) */}
      <nav className="md:hidden fixed bottom-6 left-4 right-4 bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-[0_20px_40px_-5px_rgba(0,0,0,0.5)] z-40 rounded-[2rem] overflow-hidden">
        <div 
          className="flex flex-nowrap overflow-x-auto items-center p-2 gap-1 w-full"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          <style>{`.overflow-x-auto::-webkit-scrollbar { display: none; }`}</style>
          {links.map((link) => {
            const isActive = pathname?.startsWith(link.href);
            return (
              <Link 
                key={link.href} 
                href={link.href} 
                className={`relative flex flex-col items-center justify-center p-2 rounded-[1.5rem] transition-all shrink-0 min-w-[76px] ${isActive ? 'bg-gradient-to-t from-blue-500/10 to-transparent' : 'hover:bg-white/5'}`}
              >
                {isActive && (
                  <div className="absolute top-0 w-8 h-1 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-b-full shadow-[0_2px_10px_rgba(96,165,250,0.8)]"></div>
                )}
                <div className={`p-1.5 rounded-2xl mb-1 ${isActive ? 'text-blue-400 bg-blue-500/10 shadow-[0_0_15px_rgba(96,165,250,0.2)]' : 'text-slate-400'}`}>
                  <link.icon size={22} className={isActive ? "drop-shadow-md" : ""} />
                </div>
                <span className={`text-[9px] uppercase font-bold tracking-widest text-center w-full truncate ${isActive ? 'text-blue-300 opacity-100' : 'text-slate-500 opacity-80'}`}>
                  {link.name}
                </span>
              </Link>
            );
          })}
          <div className="shrink-0 px-2 flex items-center justify-center border-l border-white/10 ml-1 pl-3">
            <LoanSimulator />
          </div>
        </div>
      </nav>
      
    </div>
  );
}

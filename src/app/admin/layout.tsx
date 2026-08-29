"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, UserCog, DollarSign, LogOut, ClipboardList } from "lucide-react";
import { signOut } from "next-auth/react";
import LoanSimulator from "@/components/LoanSimulator";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const links = [
    { name: "Solicitudes", href: "/admin/solicitudes", icon: ClipboardList },
    { name: "Clientes", href: "/admin/clientes", icon: Users },
    { name: "Cobradores", href: "/admin/cobradores", icon: UserCog },
    { name: "Recaudaciones", href: "/admin/recaudaciones", icon: DollarSign },
    { name: "Resumen", href: "/admin/resumen", icon: LayoutDashboard },
  ];

  const handleLogout = async () => {
    await signOut({ redirect: false });
    window.location.href = '/login';
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="w-64 bg-white p-6 flex-col justify-between hidden md:flex border-r border-slate-200">
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
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all w-full mt-8"
        >
          <LogOut size={20} />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </aside>

      {/* Mobile Top Header (only on mobile) */}
      <header className="md:hidden bg-emerald-600 text-white p-4 shadow-md sticky top-0 z-30 flex justify-between items-center rounded-b-2xl">
        <h1 className="font-bold text-xl tracking-tight">RYB Admin</h1>
        <button 
          onClick={handleLogout}
          className="p-2 bg-emerald-700/60 rounded-full hover:bg-emerald-800/80 transition-colors"
          title="Cerrar sesión"
        >
          <LogOut size={18} />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 pb-24 md:pb-8">
        <div className="max-w-7xl mx-auto h-full">
          {children}
        </div>
      </main>

      {/* Mobile Floating Bottom Navigation (only on mobile) */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-slate-100 shadow-[0_-15px_30px_-5px_rgba(0,0,0,0.08)] flex justify-around p-3 pb-6 z-40 rounded-t-[2rem]">
        {links.map((link) => {
          const isActive = pathname?.startsWith(link.href);
          return (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`flex flex-col items-center px-4 py-2 transition-colors ${isActive ? 'text-emerald-600' : 'text-slate-400 hover:text-emerald-500'}`}
            >
              <link.icon size={24} />
              <span className="text-[10px] uppercase font-bold tracking-wider mt-1.5 opacity-90">{link.name}</span>
            </Link>
          );
        })}
        <LoanSimulator />
      </nav>
      
    </div>
  );
}

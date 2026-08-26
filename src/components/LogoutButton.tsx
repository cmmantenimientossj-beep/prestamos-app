"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button 
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="p-2 bg-emerald-700/60 rounded-full hover:bg-emerald-800/80 transition-colors shrink-0"
      title="Cerrar sesión"
    >
      <LogOut size={18} />
    </button>
  );
}

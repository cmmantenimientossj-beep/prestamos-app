"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button 
      onClick={async () => {
        await signOut({ redirect: false });
        window.location.href = '/login';
      }}
      className="px-3 py-1.5 text-sm font-medium bg-emerald-700/60 rounded-full hover:bg-emerald-800/80 transition-colors shrink-0"
      title="Cerrar sesión"
    >
      Cerrar sesión
    </button>
  );
}

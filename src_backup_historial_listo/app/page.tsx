"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="text-emerald-500 font-bold">Cargando aplicación...</div>
    </div>
  );
}

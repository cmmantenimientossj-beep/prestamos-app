"use client";
import { signIn, signOut, getSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, User } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Al entrar a login, cerramos cualquier sesión previa para requerir credenciales
    signOut({ redirect: false });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    
    if (res?.error) {
      setError("Credenciales inválidas o usuario inactivo");
      setLoading(false);
    } else {
      // Redirección directa por rol sin depender de la raíz "/"
      const session = await getSession();
      const role = (session?.user as any)?.role;
      if (role === "ADMIN" || role === "ADMIN_VIEWER") {
        window.location.href = "/admin/resumen";
      } else {
        window.location.href = "/mis-rutas";
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-800 p-8 rounded-3xl shadow-2xl shadow-black/50 border border-slate-700">
        
        <div className="text-center mb-8">
           <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500 mb-2">
              RYB
           </h1>
           <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">SaaS Financiero</p>
        </div>

        {error && (
          <div className="bg-red-500/10 text-red-500 p-3 rounded-xl text-center text-sm mb-6 border border-red-500/20 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 cursor-text" size={20} />
            <input 
              type="text" 
              placeholder="Usuario o correo electrónico" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl pl-10 pr-4 py-3.5 text-white focus:outline-none focus:border-emerald-500 transition-colors shadow-inner"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 cursor-text" size={20} />
            <input 
              type="password" 
              placeholder="Contraseña" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl pl-10 pr-4 py-3.5 text-white focus:outline-none focus:border-emerald-500 transition-colors shadow-inner"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-emerald-900/30 hover:bg-emerald-500 active:scale-95 transition-all disabled:opacity-50 mt-2"
          >
            {loading ? "Verificando Auth..." : "Iniciar Sesión"}
          </button>
        </form>

      </div>
    </div>
  );
}

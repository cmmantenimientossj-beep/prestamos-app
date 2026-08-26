"use client";

import { useState, useEffect } from "react";
import { X, Download, Share } from "lucide-react";

export function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(true); // default true para evitar el parpadeo
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Si ya está instalado y ejecutándose como standalone, no mostramos nada
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsStandalone(true);
      return;
    }
    
    // Detectar si es un dispositivo Apple (iOS no soporta el evento beforeinstallprompt nativo)
    const isIosDevice = /iphone|ipad|ipod/.test(
      window.navigator.userAgent.toLowerCase()
    );
    //@ts-ignore
    const isSafariStandalone = window.navigator.standalone === true;
    
    if (isIosDevice && !isSafariStandalone) {
      setIsIOS(true);
      setIsStandalone(false);
      setShowPrompt(true);
    } else {
      setIsStandalone(false);
    }

    // Para Android y Chrome Web: atrapar el evento de instalación nativo
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault(); // Evitamos que salga la mini-barra blanca de Chrome abajo
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 bg-white/95 backdrop-blur-md shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.15)] border-t border-gray-200 flex flex-col md:flex-row items-center justify-between transition-all duration-500 ease-in-out animate-in slide-in-from-bottom-8">
      <div className="flex-1 mr-4 text-center md:text-left w-full mb-3 md:mb-0">
        <h3 className="font-bold text-gray-900 text-lg">
          ¡Instala la App!
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {isIOS ? (
            <>
              Toca el ícono <Share className="w-4 h-4 inline-block mx-1" /> abajo y selecciona <strong>Agregar a inicio</strong> para una mejor experiencia.
            </>
          ) : (
            'Instala esta aplicación en tu teléfono para acceso instantáneo y uso fluido.'
          )}
        </p>
      </div>
      <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-end">
        {!isIOS && (
          <button
            onClick={handleInstallClick}
            className="flex-1 md:flex-none flex items-center justify-center bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-500/30"
          >
            <Download className="w-4 h-4 mr-2" />
            Descargar App
          </button>
        )}
        <button
          onClick={() => setShowPrompt(false)}
          className="p-2 text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors shrink-0"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

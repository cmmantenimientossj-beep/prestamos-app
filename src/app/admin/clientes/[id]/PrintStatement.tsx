"use client";

import { Printer } from "lucide-react";
import { useEffect } from "react";

interface PrintStatementProps {
  clienteNombre: string;
  clienteDni: string;
  porcentajeCumplimiento: number;
  totalPrestamos: number;
  deudaActiva: number;
}

export default function PrintStatement({ clienteNombre, clienteDni, porcentajeCumplimiento, totalPrestamos, deudaActiva }: PrintStatementProps) {
  
  // Inject custom print styles specifically isolated from global ones
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @media print {
        body * {
          visibility: hidden;
        }
        #printable-statement, #printable-statement * {
          visibility: visible;
        }
        #printable-statement {
           position: absolute;
           left: 0;
           top: 0;
           width: 100%;
           padding: 40px;
        }
        @page { size: auto;  margin: 0mm; }
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); }
  }, []);

  const issueStatement = () => {
     window.print();
  };

  const isLibreDeuda = deudaActiva <= 0 && porcentajeCumplimiento >= 90;

  return (
    <>
      <button 
        onClick={issueStatement}
        className="w-full flex items-center justify-center gap-2 p-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold uppercase tracking-widest text-[10px] rounded-xl transition-colors shadow-sm"
      >
        <Printer size={16} /> Emitir Comprobante Formal
      </button>

      {/* Hidden layout specifically structured for printing */}
      <div id="printable-statement" className="hidden print:block p-8 bg-white text-black font-sans leading-relaxed">
         <div className="border-b-2 border-black pb-4 mb-6 flex justify-between items-end">
            <div>
               <h1 className="text-3xl font-black uppercase tracking-tighter">Soluciones RYB</h1>
               <p className="text-sm font-bold text-gray-500">Gestión de Créditos Inmediatos</p>
            </div>
            <div className="text-right">
               <p className="font-mono text-sm">{new Date().toLocaleDateString('es-AR')}</p>
            </div>
         </div>

         <div className="mb-8">
            <h2 className="text-xl font-bold uppercase mb-2">Comprobante de Estado de Cuenta</h2>
            <div className="bg-gray-100 p-4 border border-gray-300 rounded">
               <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="font-bold">Cliente:</span> {clienteNombre}</div>
                  <div><span className="font-bold">Emisión por:</span> Administración RYB</div>
                  <div><span className="font-bold">DNI:</span> {clienteDni}</div>
                  <div><span className="font-bold">N° Expediente:</span> {Math.random().toString(36).substring(2,8).toUpperCase()}</div>
               </div>
            </div>
         </div>

         <div className="mb-8 p-4 border-2 border-black uppercase text-center font-black text-2xl tracking-widest">
            {isLibreDeuda ? (
              <span className="text-black">CERTIFICADO DE LIBRE DEUDA</span>
            ) : (
              <span className="text-black">DEUDA ACTIVA: ${deudaActiva.toLocaleString('es-AR')}</span>
            )}
         </div>

         <div className="text-sm border-t border-gray-200 pt-6 space-y-4">
            <p>Se deja constancia formal del historial del cliente en nuestra base de datos.
               A la fecha de emisión de este reporte, el cliente cuenta con un total de <strong>{totalPrestamos} operaciones</strong> crediticias en la corporación con un índice de cumplimiento del <strong>{porcentajeCumplimiento}%</strong>.
            </p>
            {isLibreDeuda && (
               <p>Habiendo subsanado satisfactoriamente los saldos pendientes, se emite la constancia de <strong>Libre Deuda</strong> a su favor.</p>
            )}
         </div>

         <div className="mt-20 pt-8 border-t border-dashed border-gray-400 flex justify-end">
            <div className="text-center w-64 border-t-2 border-black pt-2">
               <p className="font-bold uppercase text-xs">Firma Autorizada y Sello</p>
               <p className="text-[10px] text-gray-500">Soluciones RYB | Administración</p>
            </div>
         </div>
      </div>
    </>
  );
}

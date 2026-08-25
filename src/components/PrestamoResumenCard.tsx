import { Calculator, MapPin, UserIcon } from "lucide-react";

export interface PrestamoResumenCardProps {
  clienteNombre: string;
  clienteDireccion: string;
  montoPrestado: number;
  montoTotalDevolver: number;
  valorCuota: number;
  cantidadCuotas: number;
  fechaEntrega: string | Date;
  tipo?: string; 
  modalidad?: string;
  codigo?: string;
}

export default function PrestamoResumenCard({
  clienteNombre,
  clienteDireccion,
  montoPrestado,
  montoTotalDevolver,
  valorCuota,
  cantidadCuotas,
  fechaEntrega,
  tipo,
  modalidad,
  codigo
}: PrestamoResumenCardProps) {
  
  const formatCurrency = (val: number) => {
    const formatter = new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    return formatter.format(val);
  };
  
  const formatDate = (date: string | Date) => {
    if (!date) return "";
    const d = typeof date === 'string' ? new Date(date + "T12:00:00") : date;
    return d.toLocaleDateString("es-AR", { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="bg-emerald-900 p-5 rounded-3xl text-emerald-50 relative overflow-hidden shadow-xl shadow-emerald-900/20 w-full hover:shadow-2xl transition-all">
      <div className="absolute right-[-20px] top-[-20px] opacity-10">
        <Calculator size={150} />
      </div>

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <h3 className="font-bold text-white text-lg flex items-center gap-2">
            <UserIcon size={18} className="text-emerald-400" /> {clienteNombre}
          </h3>
          <p className="text-sm text-emerald-200 flex items-center gap-1 mt-1 font-medium">
            <MapPin size={14} /> {clienteDireccion}
          </p>
        </div>
        {codigo && (
          <span className="bg-emerald-800/80 text-emerald-300 text-xs px-2 py-1 rounded-lg font-mono font-bold tracking-wider border border-emerald-700 shadow-sm">
            {codigo}
          </span>
        )}
      </div>
      
      <div className="flex justify-between items-end mb-4 border-b border-emerald-700/50 pb-4 relative z-10">
          <div>
            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Préstamo</p>
            <p className="text-2xl font-black text-white">{formatCurrency(montoPrestado)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">A Devolver</p>
            <p className="text-2xl font-black text-emerald-300">{formatCurrency(montoTotalDevolver)}</p>
          </div>
      </div>
      
      <div className="grid grid-cols-2 gap-y-3 text-sm text-emerald-50 relative z-10 mb-1">
        <p className="font-medium">
          <span className="text-emerald-400 font-bold mr-1">Cuotas:</span> 
          {cantidadCuotas} x {formatCurrency(valorCuota)}
        </p>
        <p className="text-right font-medium">
          <span className="text-emerald-400 font-bold mr-1">Modalidad:</span> 
          <span className="capitalize">{modalidad?.toLowerCase()}</span>
        </p>
        
        <p className="font-medium">
          <span className="text-emerald-400 font-bold mr-1">Entrega:</span> 
          <span className="capitalize">{formatDate(fechaEntrega)}</span>
        </p>
        <p className="text-right font-medium">
          <span className="text-emerald-400 font-bold mr-1">Tipo:</span> 
          <span className="capitalize">{tipo?.toLowerCase()}</span>
        </p>
      </div>
    </div>
  );
}

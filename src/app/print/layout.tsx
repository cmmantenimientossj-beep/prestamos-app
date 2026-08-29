import { ReactNode } from "react";

export default function PrintLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
       {/* 
         Thermal printers usually use 58mm paper logic.
         A width of ~300px roughly translates to 58mm on standard DPI.
       */}
      <body className="bg-white text-black font-mono antialiased" style={{ width: '100%', maxWidth: '300px', margin: '0 auto', fontSize: '12px' }}>
        {children}
      </body>
    </html>
  );
}

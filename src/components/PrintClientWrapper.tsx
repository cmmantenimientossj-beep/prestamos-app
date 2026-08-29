"use client";

import { useEffect, ReactNode } from "react";

export default function PrintClientWrapper({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Delay to let styles apply
    const t = setTimeout(() => {
      window.print();
    }, 300);
    return () => clearTimeout(t);
  }, []);

  return <>{children}</>;
}

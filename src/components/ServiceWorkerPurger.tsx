"use client";

import { useEffect } from "react";

export function ServiceWorkerPurger() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (let registration of registrations) {
          registration.unregister();
          console.log("Service Worker desenregistrado (modo dev).");
        }
      });
    }
  }, []);

  return null;
}

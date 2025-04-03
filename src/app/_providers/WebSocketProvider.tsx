"use client";

import { useWebSocket } from "~/app/_hooks/useWebSocket";

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  useWebSocket();
  return <>{children}</>;
}

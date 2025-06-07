import { useState, useEffect } from "react";
import { subscribeLogsByDeviceId, Log } from "@/lib/logs";

export function useAllLogs(deviceId: string): Log[] {
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    if (!deviceId) {
      setLogs([]);
      return;
    }
    const unsub = subscribeLogsByDeviceId(deviceId, setLogs);
    return () => {
      unsub();
    };
  }, [deviceId]);

  return logs;
}

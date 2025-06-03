import { useRef, useEffect, useCallback } from "react";
import { Client, Message } from "paho-mqtt";

const SERVER   = "bdad7492550945b4bf04f78020a9eb8d.s1.eu.hivemq.cloud";
const PORT     = 8884;
const USERNAME = "Manuel";
const PASSWORD = "Test1234";

export function useMqttPublish() {
  const clientRef = useRef<Client>(null);

  useEffect(() => {
    const client = new Client(
      `wss://${SERVER}:${PORT}/mqtt`,
      `expo-${Math.random().toString(16).substr(2)}`
    );
    client.onConnectionLost = (e) => console.warn("MQTT lost:", e);
    client.onMessageArrived = (m) =>
      console.log("MQTT ←", m.destinationName, m.payloadString);

    client.connect({
      useSSL: true,
      userName: USERNAME,
      password: PASSWORD,
      onSuccess: () => console.log("✅ MQTT connected"),
      onFailure: (e) => console.warn("❌ MQTT failed", e),
    });

    clientRef.current = client;
    return () => void client.disconnect();
  }, []);

  const publish = useCallback((topic: string, message: object) => {
    const c = clientRef.current;
    if (!c || !c.isConnected()) {
      console.warn("⚠️ MQTT not connected");
      return;
    }
    const msg = new Message(JSON.stringify(message));
    msg.destinationName = topic;
    c.send(msg);
  }, []);

  return { publish };
}

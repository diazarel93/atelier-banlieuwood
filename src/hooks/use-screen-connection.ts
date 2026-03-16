"use client";

import { useState, useEffect, useRef } from "react";

/**
 * Detects if the projected screen (/screen) is open in another tab.
 * Uses BroadcastChannel API for cross-tab communication.
 *
 * - Screen tab sends heartbeats every 5s
 * - Cockpit listens and sets isConnected = true
 * - If no heartbeat for 10s → isConnected = false
 */

const CHANNEL_NAME = "bw-screen-sync";
const HEARTBEAT_INTERVAL = 5000;
const TIMEOUT_MS = 10000;

export function useScreenHeartbeat() {
  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;
    const channel = new BroadcastChannel(CHANNEL_NAME);
    const send = () => channel.postMessage({ type: "screen-heartbeat", t: Date.now() });
    send();
    const interval = setInterval(send, HEARTBEAT_INTERVAL);
    return () => {
      clearInterval(interval);
      channel.close();
    };
  }, []);
}

export function useScreenConnection(): boolean {
  const [isConnected, setIsConnected] = useState(false);
  const lastHeartbeatRef = useRef(0);

  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;
    const channel = new BroadcastChannel(CHANNEL_NAME);

    channel.onmessage = (event) => {
      if (event.data?.type === "screen-heartbeat") {
        lastHeartbeatRef.current = Date.now();
        setIsConnected(true);
      }
    };

    const checker = setInterval(() => {
      if (lastHeartbeatRef.current > 0 && Date.now() - lastHeartbeatRef.current > TIMEOUT_MS) {
        setIsConnected(false);
      }
    }, TIMEOUT_MS);

    return () => {
      clearInterval(checker);
      channel.close();
    };
  }, []);

  return isConnected;
}

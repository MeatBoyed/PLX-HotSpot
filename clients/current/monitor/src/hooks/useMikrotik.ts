"use client";

import useSWR from "swr";
import type {
  MikrotikSystemResource,
  MikrotikHotspotActive,
  MikrotikHotspotServer,
  MikrotikHotspotUser,
  MikrotikLogEntry,
  MikrotikInterface,
  MikrotikTrafficSample,
  MikrotikDhcpLease,
} from "@/lib/mikrotik/types";

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  });

export function useSystemResource() {
  return useSWR<MikrotikSystemResource>("/api/mikrotik/system", fetcher, {
    refreshInterval: 15000,
  });
}

export function useServers() {
  return useSWR<MikrotikHotspotServer[]>("/api/mikrotik/servers", fetcher, {
    refreshInterval: 60000,
  });
}

export function useConnections(server?: string) {
  const url = server
    ? `/api/mikrotik/connections?server=${encodeURIComponent(server)}`
    : "/api/mikrotik/connections";
  return useSWR<MikrotikHotspotActive[]>(url, fetcher, {
    refreshInterval: 15000,
  });
}

export function useLogs(topic?: string) {
  const url = topic
    ? `/api/mikrotik/logs?topic=${encodeURIComponent(topic)}`
    : "/api/mikrotik/logs";
  return useSWR<MikrotikLogEntry[]>(url, fetcher, {
    refreshInterval: 20000,
  });
}

export function useUsers() {
  return useSWR<MikrotikHotspotUser[]>("/api/mikrotik/users", fetcher, {
    refreshInterval: 30000,
  });
}

export function useTraffic(iface?: string) {
  const url = iface
    ? `/api/mikrotik/traffic?interface=${encodeURIComponent(iface)}`
    : "/api/mikrotik/traffic";
  return useSWR<{ interfaces: MikrotikInterface[]; sample: MikrotikTrafficSample[] }>(
    url,
    fetcher,
    { refreshInterval: 10000 }
  );
}

export function useLeases() {
  return useSWR<MikrotikDhcpLease[]>("/api/mikrotik/leases", fetcher, {
    refreshInterval: 30000,
  });
}

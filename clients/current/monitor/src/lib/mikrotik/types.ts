export interface MikrotikSystemResource {
  "cpu-load": string;
  "free-memory": string;
  "total-memory": string;
  "free-hdd-space": string;
  "total-hdd-space": string;
  uptime: string;
  version: string;
  "board-name": string;
  architecture: string;
  "cpu-count": string;
  "cpu-frequency": string;
  "bad-blocks": string;
}

export interface MikrotikHotspotActive {
  ".id": string;
  server: string;
  user: string;
  address: string;
  "mac-address": string;
  "login-by": string;
  uptime: string;
  "bytes-in": string;
  "bytes-out": string;
  "packets-in": string;
  "packets-out": string;
  comment?: string;
  status?: string;
  session?: string;
}

export interface MikrotikHotspotServer {
  ".id": string;
  name: string;
  interface: string;
  "address-pool": string;
  profile: string;
  "idle-timeout": string;
  "keepalive-timeout": string;
  disabled: string;
}

export interface MikrotikHotspotUser {
  ".id": string;
  server: string;
  name: string;
  address?: string;
  "mac-address"?: string;
  profile: string;
  password?: string;
  comment?: string;
  disabled: string;
  "bytes-in"?: string;
  "bytes-out"?: string;
  "packets-in"?: string;
  "packets-out"?: string;
  uptime?: string;
}

export interface MikrotikHotspotUserProfile {
  ".id": string;
  name: string;
  "rate-limit"?: string;
  "shared-users"?: string;
  "session-timeout"?: string;
  "idle-timeout"?: string;
}

export interface MikrotikLogEntry {
  ".id": string;
  time: string;
  topics: string;
  message: string;
}

export interface MikrotikInterface {
  ".id": string;
  name: string;
  type: string;
  mtu: string;
  "actual-mtu": string;
  "mac-address"?: string;
  running: string;
  disabled: string;
  comment?: string;
  "tx-byte"?: string;
  "rx-byte"?: string;
  "tx-packet"?: string;
  "rx-packet"?: string;
  "tx-error"?: string;
  "rx-error"?: string;
}

export interface MikrotikTrafficSample {
  name: string;
  "rx-bits-per-second": number;
  "tx-bits-per-second": number;
}

export interface MikrotikDhcpLease {
  ".id": string;
  address: string;
  "mac-address": string;
  "client-id"?: string;
  "address-lists"?: string;
  server: string;
  "dhcp-option"?: string;
  status: string;
  "expires-after"?: string;
  "last-seen"?: string;
  disabled: string;
  dynamic: string;
  blocked: string;
  radius: string;
  hostname?: string;
  comment?: string;
}

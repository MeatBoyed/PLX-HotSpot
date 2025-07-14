import { AuthState } from "./auth/auth-service";
import { MikroTikData, MikroTikStatus, RadiusDeskUsageResponse } from "./mikrotik/mikrotik-types";
import { appConfig } from '@/lib/config';

const mockUserSession: MikroTikStatus = {
    logged_in: "yes",
    username: "testuser",
    ip: "10.5.50.100",
    mac: "00:11:22:33:44:55",
    bytes_in: "12345678",
    bytes_out: "87654321",
    bytes_in_nice: "12 MB",
    bytes_out_nice: "87 MB",
    packets_in: "1234",
    packets_out: "4321",
    uptime: "01:23:45",
    session_time_left: "00:36:15",
    remain_bytes_in: "5000000",
    remain_bytes_out: "4000000",
    link_login_only: "https://10.5.50.1/login",
    link_logout: "https://10.5.50.1/logout",
};

const mockUserUsage: RadiusDeskUsageResponse = {
    success: true,
    data: {
        data_used: 1024,
        data_cap: 2048,
        time_used: 3600,
        time_cap: 7200,
        depleted: false,
    },
    message: "Usage data retrieved successfully.",
};

const mockMikrotikData: MikroTikData = {
    link_login_only: "https://10.5.50.1/login",
    link_logout: "https://10.5.50.1/logout",
    link_status: "https://10.5.50.1/status",
    loginlink: "https://10.5.50.1/login",
    mac: "00:11:22:33:44:55",
    nasid: "nas-id",
    ssid: appConfig.hotspot.ssid,
    type: "mikrotik"
}

export const seedAuthState: AuthState = {
    isAuthenticated: false,
    mikrotikData: mockMikrotikData,
    userSession: mockUserSession,
    userUsage: mockUserUsage,
    error: undefined
};
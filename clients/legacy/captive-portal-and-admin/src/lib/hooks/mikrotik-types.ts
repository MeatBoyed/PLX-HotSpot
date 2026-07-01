// Temporary minimal type definitions (replace with generated or real types when available)

export interface MikroTikStatus {
    loggedIn: boolean;
    username?: string;
    ip?: string;
    bytesIn?: number;
    bytesOut?: number;
}

export interface RadiusDeskUsageResponse {
    success: boolean;
    data?: {
        depleted?: boolean;
        totalBytes?: number;
        usedBytes?: number;
    };
    message?: string;
}

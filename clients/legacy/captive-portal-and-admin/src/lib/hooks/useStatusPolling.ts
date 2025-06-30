import { useState, useEffect, useCallback } from 'react';
import { MikroTikStatus, RadiusDeskUsageResponse } from '@/lib/mikrotik/mikrotik-types';

interface PollResponse {
    success: boolean;
    data?: {
        userSession: MikroTikStatus;
        userUsage: RadiusDeskUsageResponse | null;
    };
    message?: string;
}

interface UseStatusPollingProps {
    initialStatus: MikroTikStatus;
    initialUsage?: RadiusDeskUsageResponse | null;
    pollingIntervalMs?: number;
    enabled?: boolean;
}

export function useStatusPolling({
    initialStatus,
    initialUsage,
    pollingIntervalMs = 30000, // Default 30 seconds
    enabled = true
}: UseStatusPollingProps) {
    const [status, setStatus] = useState<MikroTikStatus>(initialStatus);
    const [userUsage, setUserUsage] = useState<RadiusDeskUsageResponse | null>(initialUsage || null);

    const pollStatus = useCallback(async () => {
        try {
            const response = await fetch('/api/status-poll', {
                method: 'GET',
                cache: 'no-cache'
            });

            if (!response.ok) {
                console.error('Poll failed:', response.status);
                return;
            }

            const result: PollResponse = await response.json();

            if (result.success && result.data) {
                setStatus(result.data.userSession);
                setUserUsage(result.data.userUsage);
                console.log('Status updated:', result.data.userSession);
            }
        } catch (error) {
            console.error('Poll error:', error);
        }
    }, []);

    // Set up polling
    useEffect(() => {
        if (!enabled) return;

        const interval = setInterval(pollStatus, pollingIntervalMs);

        return () => clearInterval(interval);
    }, [enabled, pollingIntervalMs, pollStatus]);

    return {
        status,
        userUsage,
        refreshStatus: pollStatus
    };
}

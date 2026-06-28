"use server";
import { prisma } from '@/lib/services/database-service';

export type MarketingSubmission = {
    id: number;
    ssid: string;
    email: string;
    agreed: boolean;
    ip_address: string | null;
    unsubscribed: boolean;
    unsubscribed_at: Date | null;
    created_at: Date;
};

export async function listMarketingSubmissionsAction(ssid?: string): Promise<MarketingSubmission[]> {
    const rows = await prisma.marketing_opt_in_submission.findMany({
        where: ssid ? { ssid } : undefined,
        orderBy: { created_at: 'desc' },
    });
    return rows.map(r => ({
        id: r.id,
        ssid: r.ssid,
        email: r.email,
        agreed: r.agreed,
        ip_address: r.ip_address,
        unsubscribed: r.unsubscribed,
        unsubscribed_at: r.unsubscribed_at,
        created_at: r.created_at,
    }));
}

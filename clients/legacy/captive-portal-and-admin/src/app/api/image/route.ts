import { NextRequest, NextResponse } from 'next/server';
import { databaseService } from '@/lib/services/database-service';
import { imageService } from '@/lib/services/image-service';

// Define allowed field names as a const tuple to derive a union type
const allowedFieldNames = [
    'logo',
    'logoWhite',
    'connectCardBackground',
    'bannerOverlay',
    'favicon',
    'splashBackground',
] as const;
type AllowedField = typeof allowedFieldNames[number];
const allowedFields = new Set<AllowedField>(allowedFieldNames);

const allowedMime = new Set(['image/png', 'image/jpeg', 'image/webp']);
const maxBytes = 20 * 1024 * 1024;

function toBuffer(file: File): Promise<Buffer> {
    return file.arrayBuffer().then((ab) => Buffer.from(ab));
}

// Type guard to narrow arbitrary strings to AllowedField
function isAllowedField(name: string): name is AllowedField {
    return (allowedFields as Set<string>).has(name);
}

export async function POST(req: NextRequest) {
    const ssid = req.nextUrl.searchParams.get('ssid') || '';
    if (!ssid) return NextResponse.json({ error: 'Missing ssid' }, { status: 400 });
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.startsWith('multipart/form-data')) {
        return NextResponse.json({ error: 'Content-Type must be multipart/form-data' }, { status: 400 });
    }

    try {
        const form = await req.formData();
        const updates: Partial<Record<AllowedField, string>> = {};

        for (const [field, val] of form.entries()) {
            if (!(val instanceof File)) continue;
            if (!isAllowedField(field)) continue; // ignore unknown fields silently
            if (!allowedMime.has(val.type)) {
                return NextResponse.json({ error: `${field}: Unsupported MIME` }, { status: 400 });
            }
            if (val.size > maxBytes) {
                return NextResponse.json({ error: `${field}: File exceeds 20MB` }, { status: 400 });
            }
            const data = await toBuffer(val);
            // Enforce slug consistency: slug == field
            await imageService.overwriteWithBackup(ssid, field, val.type, data);
            // Update brand_config.<field> = field (slug string)
            updates[field] = field;
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: 'No valid image fields found' }, { status: 400 });
        }

        // Update only provided fields (typed; no `any`)
        const res = await databaseService.updateBrandingConfigApp(ssid, updates);
        if (!res) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json({ res });
    } catch (e) {
        console.error('[IMAGE:POST] error', e);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}

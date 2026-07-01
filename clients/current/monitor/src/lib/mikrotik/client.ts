import { logger } from "@/lib/logger";

const host = process.env.MIKROTIK_HOST!;
const user = process.env.MIKROTIK_USER!;
const pass = process.env.MIKROTIK_PASS!;

// Next.js bundles undici for fetch — Node https.Agent doesn't work.
// Setting NODE_TLS_REJECT_UNAUTHORIZED=0 is the reliable way to skip cert
// verification when the MikroTik has a self-signed or expired certificate.
if (process.env.MIKROTIK_TLS_VERIFY === "false") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const base = `https://${host}/rest`;
const authHeader = `Basic ${Buffer.from(`${user}:${pass}`).toString("base64")}`;

export async function mikrotik<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const url = `${base}${path}`;
  const start = Date.now();

  try {
    const res = await fetch(url, {
      ...init,
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
        ...init.headers,
      },
    });

    const duration = Date.now() - start;

    if (!res.ok) {
      logger.error(
        { path, status: res.status, duration },
        "MikroTik API error"
      );
      throw new Error(`MikroTik ${res.status}: ${await res.text()}`);
    }

    logger.debug({ path, status: res.status, duration }, "MikroTik API call");
    return res.json() as Promise<T>;
  } catch (err) {
    const duration = Date.now() - start;
    logger.error({ err, path, duration }, "MikroTik API call failed");
    throw err;
  }
}

export async function mikrotikDelete(path: string): Promise<void> {
  await mikrotik(path, { method: "DELETE" });
}

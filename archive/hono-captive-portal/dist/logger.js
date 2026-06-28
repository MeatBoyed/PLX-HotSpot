import fs from 'node:fs';
import path from 'node:path';
const LOG_DIR = path.resolve(process.cwd(), 'logs');
const ACCESS_LOG = path.join(LOG_DIR, 'access.log');
const APP_LOG = path.join(LOG_DIR, 'app.log');
function ensureLogDir() {
    try {
        fs.mkdirSync(LOG_DIR, { recursive: true });
    }
    catch { }
}
ensureLogDir();
const accessStream = fs.createWriteStream(ACCESS_LOG, { flags: 'a' });
const appStream = fs.createWriteStream(APP_LOG, { flags: 'a' });
export function logAccess(line) {
    const ts = new Date().toISOString();
    accessStream.write(`[${ts}] ${line}\n`);
}
export function logApp(obj) {
    const ts = new Date().toISOString();
    try {
        appStream.write(JSON.stringify({ ts, ...(obj ?? {}) }) + '\n');
    }
    catch {
        appStream.write(`[${ts}] [unserializable] ${String(obj)}\n`);
    }
}
process.on('beforeExit', () => {
    accessStream.end();
    appStream.end();
});

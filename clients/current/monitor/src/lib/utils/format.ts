export function formatBytes(bytes: number): string {
  if (!bytes || isNaN(bytes)) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  let val = bytes;
  while (val >= 1024 && i < units.length - 1) {
    val /= 1024;
    i++;
  }
  return `${val.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function formatBits(bps: number): string {
  if (!bps || isNaN(bps)) return "0 bps";
  const units = ["bps", "Kbps", "Mbps", "Gbps"];
  let i = 0;
  let val = bps;
  while (val >= 1000 && i < units.length - 1) {
    val /= 1000;
    i++;
  }
  return `${val.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function memPercent(free: string, total: string): number {
  const f = parseInt(free);
  const t = parseInt(total);
  if (!t) return 0;
  return Math.round(((t - f) / t) * 100);
}

"use client";

import { useEffect, useMemo, useState } from "react";
import Head from "@/components/home-page/head";
import { listMarketingSubmissionsAction, MarketingSubmission } from "./actions";

type StatusFilter = "all" | "subscribed" | "unsubscribed";

const PAGE_SIZE = 20;

function fmt(d: Date | null | undefined) {
    if (!d) return "—";
    return new Date(d).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" });
}

function exportCsv(rows: MarketingSubmission[]) {
    const headers = ["ID", "SSID", "Email", "Status", "Subscribed On", "Unsubscribed On", "IP Address"];
    const lines = rows.map(r => [
        r.id,
        r.ssid,
        r.email,
        r.unsubscribed ? "Unsubscribed" : "Subscribed",
        fmt(r.created_at),
        fmt(r.unsubscribed_at),
        r.ip_address ?? "",
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));

    const csv = [headers.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `marketing-optin-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

export default function MarketingOptInAdminPage() {
    const [all, setAll] = useState<MarketingSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [ssidFilter, setSsidFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [page, setPage] = useState(1);

    useEffect(() => {
        listMarketingSubmissionsAction()
            .then(setAll)
            .finally(() => setLoading(false));
    }, []);

    // Reset to page 1 whenever filters change
    useEffect(() => { setPage(1); }, [search, ssidFilter, statusFilter]);

    const ssids = useMemo(() => ["all", ...Array.from(new Set(all.map(r => r.ssid))).sort()], [all]);

    const filtered = useMemo(() => {
        return all.filter(r => {
            if (ssidFilter !== "all" && r.ssid !== ssidFilter) return false;
            if (statusFilter === "subscribed" && r.unsubscribed) return false;
            if (statusFilter === "unsubscribed" && !r.unsubscribed) return false;
            if (search.trim()) {
                const q = search.trim().toLowerCase();
                if (!r.email.toLowerCase().includes(q) && !r.ssid.toLowerCase().includes(q)) return false;
            }
            return true;
        });
    }, [all, ssidFilter, statusFilter, search]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    // Stats — always from full dataset
    const total = all.length;
    const subscribed = all.filter(r => !r.unsubscribed).length;
    const unsubscribed = all.filter(r => r.unsubscribed).length;

    return (
        <div className="max-w-5xl mx-auto py-8 px-4 space-y-6">
            <nav className="flex items-center justify-center w-full">
                <Head />
            </nav>

            <div>
                <h1 className="text-2xl font-semibold">Marketing Opt-In</h1>
                <p className="text-sm text-muted-foreground mt-1">All email submissions across all venues.</p>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                    { label: "Total Submissions", value: total, color: "bg-blue-50 border-blue-200 text-blue-800" },
                    { label: "Active Subscribers", value: subscribed, color: "bg-green-50 border-green-200 text-green-800" },
                    { label: "Unsubscribed", value: unsubscribed, color: "bg-red-50 border-red-200 text-red-800" },
                ].map(({ label, value, color }) => (
                    <div key={label} className={`border rounded-lg p-4 ${color}`}>
                        <p className="text-2xl font-bold">{loading ? "—" : value}</p>
                        <p className="text-xs font-medium mt-0.5">{label}</p>
                    </div>
                ))}
            </div>

            {/* Filters + Export */}
            <div className="flex flex-wrap gap-3 items-end">
                <div className="flex flex-col gap-1 flex-1 min-w-40">
                    <label className="text-xs font-medium text-muted-foreground">Search email / venue</label>
                    <input
                        className="border rounded px-2 py-1.5 text-sm bg-white"
                        placeholder="e.g. user@email.com"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-muted-foreground">Venue (SSID)</label>
                    <select
                        className="border rounded px-2 py-1.5 text-sm bg-white"
                        value={ssidFilter}
                        onChange={e => setSsidFilter(e.target.value)}
                    >
                        {ssids.map(s => (
                            <option key={s} value={s}>{s === "all" ? "All Venues" : s}</option>
                        ))}
                    </select>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-muted-foreground">Status</label>
                    <select
                        className="border rounded px-2 py-1.5 text-sm bg-white"
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value as StatusFilter)}
                    >
                        <option value="all">All</option>
                        <option value="subscribed">Subscribed</option>
                        <option value="unsubscribed">Unsubscribed</option>
                    </select>
                </div>
                <button
                    onClick={() => exportCsv(filtered)}
                    disabled={filtered.length === 0}
                    className="border rounded px-4 py-1.5 text-sm font-medium bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Export CSV ({filtered.length})
                </button>
            </div>

            {/* Table */}
            <div className="border rounded overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-muted/40 text-left border-b">
                            <th className="px-3 py-2 font-medium">Email</th>
                            <th className="px-3 py-2 font-medium">Venue</th>
                            <th className="px-3 py-2 font-medium">Status</th>
                            <th className="px-3 py-2 font-medium">Subscribed On</th>
                            <th className="px-3 py-2 font-medium">Unsubscribed On</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr>
                                <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">Loading...</td>
                            </tr>
                        )}
                        {!loading && paginated.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">No results found.</td>
                            </tr>
                        )}
                        {!loading && paginated.map(r => (
                            <tr key={r.id} className="border-t hover:bg-muted/20">
                                <td className="px-3 py-2">{r.email}</td>
                                <td className="px-3 py-2 text-muted-foreground">{r.ssid}</td>
                                <td className="px-3 py-2">
                                    {r.unsubscribed
                                        ? <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">Unsubscribed</span>
                                        : <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Subscribed</span>
                                    }
                                </td>
                                <td className="px-3 py-2 text-muted-foreground">{fmt(r.created_at)}</td>
                                <td className="px-3 py-2 text-muted-foreground">{fmt(r.unsubscribed_at)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {!loading && filtered.length > 0 && (
                <div className="flex items-center justify-between text-sm">
                    <p className="text-muted-foreground">
                        Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                    </p>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setPage(1)}
                            disabled={page === 1}
                            className="border rounded px-2 py-1 disabled:opacity-40 hover:bg-muted/20"
                        >«</button>
                        <button
                            onClick={() => setPage(p => p - 1)}
                            disabled={page === 1}
                            className="border rounded px-2 py-1 disabled:opacity-40 hover:bg-muted/20"
                        >‹</button>
                        <span className="px-3 py-1 font-medium">Page {page} of {totalPages}</span>
                        <button
                            onClick={() => setPage(p => p + 1)}
                            disabled={page === totalPages}
                            className="border rounded px-2 py-1 disabled:opacity-40 hover:bg-muted/20"
                        >›</button>
                        <button
                            onClick={() => setPage(totalPages)}
                            disabled={page === totalPages}
                            className="border rounded px-2 py-1 disabled:opacity-40 hover:bg-muted/20"
                        >»</button>
                    </div>
                </div>
            )}
        </div>
    );
}

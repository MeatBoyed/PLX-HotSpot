"use client";

import { useState } from "react";
import { useLogs } from "@/hooks/useMikrotik";
import { SearchInput } from "@/components/shared/SearchInput";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";

const TOPICS = ["hotspot", "dhcp", "firewall", "system", "error", "warning"] as const;

function severityClass(topics: string) {
  if (topics.includes("error") || topics.includes("critical")) return "text-red-600 dark:text-red-400";
  if (topics.includes("warning")) return "text-amber-600 dark:text-amber-400";
  return "";
}

export function LogsTable() {
  const [topic, setTopic] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState("");
  const [serverFilter, setServerFilter] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { data, isLoading, mutate } = useLogs(topic);

  const filtered = data?.filter((entry) => {
    const q = search.toLowerCase();
    const sv = serverFilter.toLowerCase();
    const matchSearch = !q || entry.message.toLowerCase().includes(q);
    const matchServer = !sv || entry.message.toLowerCase().includes(sv);
    return matchSearch && matchServer;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <SearchInput value={search} onChange={setSearch} placeholder="Search log messages…" />
        <SearchInput value={serverFilter} onChange={setServerFilter} placeholder="Filter by server name…" />
        <Button
          size="sm"
          variant={autoRefresh ? "default" : "outline"}
          onClick={() => setAutoRefresh((v) => !v)}
          className="gap-1.5"
        >
          <RefreshCw className="h-3 w-3" />
          Auto-refresh
        </Button>
        <Button size="sm" variant="ghost" onClick={() => mutate()}>
          Refresh now
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button
          size="sm"
          variant={!topic ? "default" : "outline"}
          onClick={() => setTopic(undefined)}
        >
          All
        </Button>
        {TOPICS.map((t) => (
          <Button
            key={t}
            size="sm"
            variant={topic === t ? "default" : "outline"}
            onClick={() => setTopic(topic === t ? undefined : t)}
          >
            {t}
          </Button>
        ))}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-40">Time</TableHead>
              <TableHead className="w-48">Topics</TableHead>
              <TableHead>Message</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i}>
                    {[40, 48, "full"].map((w, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : filtered?.map((entry) => (
                  <TableRow key={entry[".id"]}>
                    <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                      {entry.time}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs font-mono">
                        {entry.topics}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={cn(
                        "font-mono text-xs break-all",
                        severityClass(entry.topics)
                      )}
                    >
                      {entry.message}
                    </TableCell>
                  </TableRow>
                ))}
            {!isLoading && filtered?.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                  No log entries
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {filtered && filtered.length > 0 && (
        <p className="text-xs text-muted-foreground text-right">
          Showing {filtered.length} entries
        </p>
      )}
    </div>
  );
}

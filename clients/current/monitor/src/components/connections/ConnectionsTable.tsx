"use client";

import { useState } from "react";
import { useConnections } from "@/hooks/useMikrotik";
import { SearchInput } from "@/components/shared/SearchInput";
import { ServerFilter } from "@/components/shared/ServerFilter";
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
import { formatBytes } from "@/lib/utils/format";
import { toast } from "sonner";

export function ConnectionsTable() {
  const [server, setServer] = useState<string | null>("all");
  const [search, setSearch] = useState("");

  const { data, isLoading, mutate } = useConnections(
    !server || server === "all" ? undefined : server
  );

  const filtered = data?.filter((c) => {
    const q = search.toLowerCase();
    return (
      !q ||
      c.user.toLowerCase().includes(q) ||
      c.address.includes(q) ||
      c["mac-address"].toLowerCase().includes(q)
    );
  });

  async function disconnect(c: NonNullable<typeof data>[number]) {
    try {
      const res = await fetch("/api/mikrotik/connections", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: c[".id"],
          username: c.user,
          server: c.server,
          address: c.address,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(`Disconnected ${c.user}`);
      mutate();
    } catch {
      toast.error("Failed to disconnect user");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search username, IP, MAC…"
        />
        <ServerFilter value={server} onChange={setServer} />
        <Badge variant="outline" className="ml-auto">
          {filtered?.length ?? 0} sessions
        </Badge>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Server</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>MAC</TableHead>
              <TableHead>Uptime</TableHead>
              <TableHead>Down</TableHead>
              <TableHead>Up</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : filtered?.map((c) => (
                  <TableRow key={c[".id"]}>
                    <TableCell className="font-medium">{c.user}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{c.server}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{c.address}</TableCell>
                    <TableCell className="font-mono text-sm">{c["mac-address"]}</TableCell>
                    <TableCell>{c.uptime}</TableCell>
                    <TableCell>{formatBytes(Number(c["bytes-in"]))}</TableCell>
                    <TableCell>{formatBytes(Number(c["bytes-out"]))}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => disconnect(c)}
                      >
                        Disconnect
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            {!isLoading && filtered?.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  No active connections
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

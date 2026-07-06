"use client";

import { useState } from "react";
import { useSystemResource, useTraffic, useLeases } from "@/hooks/useMikrotik";
import { SearchInput } from "@/components/shared/SearchInput";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { memPercent, formatBytes } from "@/lib/utils/format";
import { Cpu, HardDrive, MemoryStick, Network } from "lucide-react";

export default function SystemPage() {
  const [leaseSearch, setLeaseSearch] = useState("");
  const { data: sys, isLoading: sysLoading } = useSystemResource();
  const { data: traffic, isLoading: trafficLoading } = useTraffic();
  const { data: leases, isLoading: leasesLoading } = useLeases();

  const filteredLeases = leases?.filter((l) => {
    const q = leaseSearch.toLowerCase();
    return (
      !q ||
      l.address.includes(q) ||
      l["mac-address"].toLowerCase().includes(q) ||
      (l.hostname ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">System</h1>
        {sys && (
          <p className="text-sm text-muted-foreground mt-1">
            {sys["board-name"]} · {sys.architecture} · RouterOS {sys.version}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="CPU Load"
          value={sys ? `${sys["cpu-load"]}%` : undefined}
          sub={sys ? `${sys["cpu-count"]} cores` : undefined}
          icon={Cpu}
          loading={sysLoading}
        />
        <StatsCard
          title="RAM Used"
          value={sys ? `${memPercent(sys["free-memory"], sys["total-memory"])}%` : undefined}
          sub={
            sys
              ? `${formatBytes(parseInt(sys["free-memory"]))} free of ${formatBytes(parseInt(sys["total-memory"]))}`
              : undefined
          }
          icon={MemoryStick}
          loading={sysLoading}
        />
        <StatsCard
          title="Disk Free"
          value={sys ? formatBytes(parseInt(sys["free-hdd-space"])) : undefined}
          sub={sys ? `of ${formatBytes(parseInt(sys["total-hdd-space"]))}` : undefined}
          icon={HardDrive}
          loading={sysLoading}
        />
        <StatsCard
          title="Interfaces"
          value={traffic?.interfaces?.length}
          icon={Network}
          loading={trafficLoading}
        />
      </div>

      {/* Interfaces table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Interfaces</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>MTU</TableHead>
                  <TableHead>RX</TableHead>
                  <TableHead>TX</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trafficLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 6 }).map((_, j) => (
                          <TableCell key={j}>
                            <Skeleton className="h-4 w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  : traffic?.interfaces?.map((iface) => (
                      <TableRow key={iface[".id"]}>
                        <TableCell className="font-medium">{iface.name}</TableCell>
                        <TableCell className="text-muted-foreground">{iface.type}</TableCell>
                        <TableCell>
                          <Badge variant={iface.running === "true" ? "default" : "secondary"}>
                            {iface.running === "true" ? "running" : "down"}
                          </Badge>
                        </TableCell>
                        <TableCell>{iface.mtu}</TableCell>
                        <TableCell>{formatBytes(parseInt(iface["rx-byte"] ?? "0"))}</TableCell>
                        <TableCell>{formatBytes(parseInt(iface["tx-byte"] ?? "0"))}</TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* DHCP leases */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">DHCP Leases</CardTitle>
          <Badge variant="outline">{filteredLeases?.length ?? 0}</Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          <SearchInput
            value={leaseSearch}
            onChange={setLeaseSearch}
            placeholder="Search IP, MAC, hostname…"
          />
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>IP Address</TableHead>
                  <TableHead>MAC</TableHead>
                  <TableHead>Hostname</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expires</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leasesLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 5 }).map((_, j) => (
                          <TableCell key={j}>
                            <Skeleton className="h-4 w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  : filteredLeases?.map((lease) => (
                      <TableRow key={lease[".id"]}>
                        <TableCell className="font-mono text-sm">{lease.address}</TableCell>
                        <TableCell className="font-mono text-sm">{lease["mac-address"]}</TableCell>
                        <TableCell>{lease.hostname ?? "—"}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              lease.status === "bound"
                                ? "default"
                                : lease.status === "waiting"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {lease.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {lease["expires-after"] ?? "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                {!leasesLoading && filteredLeases?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No leases found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

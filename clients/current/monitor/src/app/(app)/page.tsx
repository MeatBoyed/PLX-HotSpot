"use client";

import { StatsCard } from "@/components/dashboard/StatsCard";
import { ServerBreakdown } from "@/components/dashboard/ServerBreakdown";
import { useSystemResource, useConnections, useLogs } from "@/hooks/useMikrotik";
import { memPercent } from "@/lib/utils/format";
import { Cpu, MemoryStick, Clock, Users, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function severityClass(topics: string) {
  if (topics.includes("error") || topics.includes("critical")) return "text-red-600";
  if (topics.includes("warning")) return "text-amber-600";
  return "text-muted-foreground";
}

export default function DashboardPage() {
  const { data: sys, isLoading: sysLoading } = useSystemResource();
  const { data: connections, isLoading: connLoading } = useConnections();
  const { data: logs } = useLogs("hotspot,error,warning");

  const recentLogs = logs?.slice(-5).reverse() ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        {sys && (
          <p className="text-sm text-muted-foreground mt-1">
            {sys["board-name"]} · RouterOS {sys.version}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="CPU Load"
          value={sys ? `${sys["cpu-load"]}%` : undefined}
          sub={sys ? `${sys["cpu-count"]} core @ ${sys["cpu-frequency"]} MHz` : undefined}
          icon={Cpu}
          loading={sysLoading}
        />
        <StatsCard
          title="Memory Used"
          value={sys ? `${memPercent(sys["free-memory"], sys["total-memory"])}%` : undefined}
          sub={sys ? `${Math.round(parseInt(sys["free-memory"]) / 1024 / 1024)} MB free` : undefined}
          icon={MemoryStick}
          loading={sysLoading}
        />
        <StatsCard
          title="Uptime"
          value={sys?.uptime}
          icon={Clock}
          loading={sysLoading}
        />
        <StatsCard
          title="Active Sessions"
          value={connLoading ? undefined : (connections?.length ?? 0)}
          icon={Users}
          loading={connLoading}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Sessions by Server</CardTitle>
          </CardHeader>
          <CardContent>
            <ServerBreakdown />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Recent Log Activity</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            {recentLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent entries</p>
            ) : (
              recentLogs.map((entry) => (
                <div key={entry[".id"]} className="flex gap-2 text-xs">
                  <span className="text-muted-foreground whitespace-nowrap font-mono">
                    {entry.time}
                  </span>
                  <Badge variant="outline" className="text-xs font-mono shrink-0">
                    {entry.topics}
                  </Badge>
                  <span className={cn("truncate font-mono", severityClass(entry.topics))}>
                    {entry.message}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

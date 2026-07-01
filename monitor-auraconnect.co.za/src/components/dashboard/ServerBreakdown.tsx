"use client";

import { Badge } from "@/components/ui/badge";
import { useConnections, useServers } from "@/hooks/useMikrotik";
import { Skeleton } from "@/components/ui/skeleton";
import { Wifi } from "lucide-react";

export function ServerBreakdown() {
  const { data: servers, isLoading: serversLoading } = useServers();
  const { data: connections, isLoading: connLoading } = useConnections();

  if (serversLoading || connLoading) {
    return (
      <div className="flex gap-2 flex-wrap">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-7 w-28" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {servers?.map((s) => {
        const count = connections?.filter((c) => c.server === s.name).length ?? 0;
        return (
          <Badge key={s[".id"]} variant="secondary" className="gap-1.5 px-3 py-1">
            <Wifi className="h-3 w-3" />
            {s.name}
            <span className="font-bold ml-1">{count}</span>
          </Badge>
        );
      })}
    </div>
  );
}

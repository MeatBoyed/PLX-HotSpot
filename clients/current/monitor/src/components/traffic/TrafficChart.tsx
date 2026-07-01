"use client";

import { useState, useEffect, useRef } from "react";
import { useTraffic } from "@/hooks/useMikrotik";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { formatBits } from "@/lib/utils/format";

interface DataPoint {
  t: string;
  rx: number;
  tx: number;
}

export function TrafficChart() {
  const [iface, setIface] = useState("ether1");
  const { data, isLoading } = useTraffic(iface);
  const history = useRef<DataPoint[]>([]);

  useEffect(() => {
    if (!data?.sample?.[0]) return;
    const s = data.sample[0];
    const point: DataPoint = {
      t: new Date().toLocaleTimeString(),
      rx: s["rx-bits-per-second"],
      tx: s["tx-bits-per-second"],
    };
    history.current = [...history.current.slice(-59), point];
  }, [data]);

  const interfaces = data?.interfaces ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select value={iface} onValueChange={(v) => v && setIface(v)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {interfaces.map((i) => (
              <SelectItem key={i[".id"]} value={i.name}>
                {i.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          Updated every 10s · last 60 samples
        </span>
      </div>

      {isLoading && history.current.length === 0 ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={history.current}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="t" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
            <YAxis tickFormatter={(v) => formatBits(Number(v))} tick={{ fontSize: 11 }} width={80} />
            <Tooltip formatter={(v) => formatBits(Number(v))} />
            <Legend />
            <Line
              type="monotone"
              dataKey="rx"
              name="Download"
              stroke="#3b82f6"
              dot={false}
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="tx"
              name="Upload"
              stroke="#10b981"
              dot={false}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

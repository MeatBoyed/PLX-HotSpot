"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useServers } from "@/hooks/useMikrotik";

interface Props {
  value: string | null;
  onChange: (v: string | null) => void;
}

export function ServerFilter({ value, onChange }: Props) {
  const { data: servers } = useServers();

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="All servers" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All servers</SelectItem>
        {servers?.map((s) => (
          <SelectItem key={s[".id"]} value={s.name}>
            {s.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

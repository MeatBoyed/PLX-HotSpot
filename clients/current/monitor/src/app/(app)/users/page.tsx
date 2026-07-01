"use client";

import { useState } from "react";
import { useUsers } from "@/hooks/useMikrotik";
import { SearchInput } from "@/components/shared/SearchInput";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useUsers();

  const filtered = data?.filter((u) => {
    const q = search.toLowerCase();
    return (
      !q ||
      u.name.toLowerCase().includes(q) ||
      (u.address ?? "").includes(q) ||
      (u["mac-address"] ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Hotspot Users</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Registered users in the local hotspot database
        </p>
      </div>

      <div className="flex items-center gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search username, IP, MAC…"
        />
        <Badge variant="outline" className="ml-auto">
          {filtered?.length ?? 0} users
        </Badge>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Server</TableHead>
              <TableHead>Profile</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>MAC</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : filtered?.map((u) => (
                  <TableRow key={u[".id"]}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{u.server}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{u.profile}</TableCell>
                    <TableCell className="font-mono text-sm">{u.address ?? "—"}</TableCell>
                    <TableCell className="font-mono text-sm">{u["mac-address"] ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={u.disabled === "false" ? "default" : "destructive"}>
                        {u.disabled === "false" ? "enabled" : "disabled"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
            {!isLoading && filtered?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

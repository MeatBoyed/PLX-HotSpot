import { ConnectionsTable } from "@/components/connections/ConnectionsTable";

export default function ConnectionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Active Connections</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Live hotspot sessions — refreshes every 15s
        </p>
      </div>
      <ConnectionsTable />
    </div>
  );
}

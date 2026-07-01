import { LogsTable } from "@/components/logs/LogsTable";

export default function LogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Logs</h1>
        <p className="text-sm text-muted-foreground mt-1">
          RouterOS system log — filterable by topic, keyword, and server name
        </p>
      </div>
      <LogsTable />
    </div>
  );
}

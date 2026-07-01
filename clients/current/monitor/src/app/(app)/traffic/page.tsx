import { TrafficChart } from "@/components/traffic/TrafficChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TrafficPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Traffic</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Interface bandwidth — refreshes every 10s
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Bandwidth (bits/s)</CardTitle>
        </CardHeader>
        <CardContent>
          <TrafficChart />
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useEffect, useState } from 'react';
import { PlanCard } from '@/components/plan-card';

type Props = {
  ssid: string;
};

type Pkg = {
  id: number;
  price: number;
  description?: string | null;
  name: string;
};

export default function PackagesPlanList({ ssid, }: Props) {
  const [pkgs, setPkgs] = useState<Pkg[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      const res = await fetch(`/api/packages?ssid=${encodeURIComponent(ssid)}`, { cache: 'no-store' });
      if (!res.ok) return;
      const json = await res.json();
      if (active) setPkgs(json.packages || []);
    })();
    return () => { active = false };
  }, [ssid]);

  return (
    <div className="flex justify-center gap-3 overflow-x-auto pb-3">
      {pkgs.map((p) => (
        <PlanCard
          key={p.id}
          variant="paid"
          price={`R${p.price.toFixed(2)}`}
          totalData={p.description ?? undefined}
          name={p.name}
        />
      ))}
    </div>
  );
}

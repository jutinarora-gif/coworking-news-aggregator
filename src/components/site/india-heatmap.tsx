import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { queryOptions, useQuery } from "@tanstack/react-query";
import indiaMap from "@svg-maps/india";
import { getCityStats } from "@/lib/data.functions";

const cityStatsQuery = queryOptions({ queryKey: ["city-stats"], queryFn: () => getCityStats() });

// Calibration for @svg-maps/india viewBox "0 0 612 696"
// Linear projection tuned to bounding box of the actual paths.
const LNG_MIN = 67.5, LNG_MAX = 97.5;
const LAT_MIN = 6.5, LAT_MAX = 36.5;
const VB_W = 612, VB_H = 696;

function project(lat: number, lng: number) {
  const x = ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * VB_W;
  const y = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * VB_H;
  return { x, y };
}

export function IndiaHeatmap() {
  const [hover, setHover] = useState<number | null>(null);
  const { data: CITIES = [] } = useQuery(cityStatsQuery);
  const maxReviews = Math.max(...CITIES.map((c) => c.reviews), 1);
  const paths = (indiaMap as { locations: { path: string; name: string }[] }).locations;

  if (CITIES.length === 0) {
    return <div className="glass rounded-3xl p-6 md:p-8 h-[420px] animate-pulse" />;
  }

  return (
    <div className="glass rounded-3xl p-6 md:p-8 grid gap-8 md:grid-cols-[minmax(0,1fr),300px] items-center">
      <div className="relative">
        <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="w-full h-auto max-h-[560px]" role="img" aria-label="Coworking density across India">
          <defs>
            <linearGradient id="landFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--iris-1)" stopOpacity="0.14" />
              <stop offset="100%" stopColor="var(--iris-3)" stopOpacity="0.06" />
            </linearGradient>
            <radialGradient id="dotGrad">
              <stop offset="0%" stopColor="var(--iris-1)" stopOpacity="0.85" />
              <stop offset="70%" stopColor="var(--iris-2)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--iris-2)" stopOpacity="0" />
            </radialGradient>
          </defs>
          <g>
            {paths.map((p) => (
              <path
                key={p.name}
                d={p.path}
                fill="url(#landFill)"
                stroke="var(--iris-2)"
                strokeOpacity="0.35"
                strokeWidth="0.6"
                strokeLinejoin="round"
              />
            ))}
          </g>
          {CITIES.map((c, i) => {
            const { x, y } = project(c.lat, c.lng);
            const scale = 0.35 + (c.reviews / maxReviews) * 0.65;
            const r = 12 + scale * 30;
            const active = hover === i;
            return (
              <a
                key={c.name}
                href={`/spaces?city=${encodeURIComponent(c.name)}`}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                style={{ cursor: "pointer" }}
              >
                <circle cx={x} cy={y} r={r} fill="url(#dotGrad)" opacity={active ? 0.95 : 0.65}>
                  <animate attributeName="r" values={`${r};${r + 3};${r}`} dur={`${2.5 + i * 0.2}s`} repeatCount="indefinite" />
                </circle>
                <circle cx={x} cy={y} r={3.5 + scale * 2.5} fill="var(--iris-2)" stroke="var(--background)" strokeWidth="1.2" />
                {(active || c.reviews >= 15) && (
                  <text
                    x={x + r * 0.55}
                    y={y - r * 0.55}
                    fontSize="14"
                    fill="var(--foreground)"
                    opacity={active ? 1 : 0.85}
                    className="font-display"
                    style={{ fontWeight: 600, paintOrder: "stroke", stroke: "var(--background)", strokeWidth: 3 }}
                  >
                    {c.name}
                  </text>
                )}
              </a>
            );
          })}

        </svg>
      </div>
      <div>
        <div className="text-xs uppercase tracking-widest text-iris">Live density</div>
        <h3 className="mt-1 font-display text-2xl">Reviews by city</h3>
        <p className="mt-2 text-sm text-muted-foreground">Bubble size grows with review volume from real coworkers. Hover to focus.</p>
        <ul className="mt-5 space-y-1.5 text-sm">
          {CITIES.slice(0, 8).map((c, i) => (
            <li key={c.name}>
              <Link
                to="/spaces"
                search={{ city: c.name }}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                className={`flex items-center justify-between rounded-lg px-3 py-2 transition-colors ${hover === i ? "bg-accent" : "hover:bg-accent/60"}`}
              >
                <span className="font-display">{c.name}</span>
                <span className="text-xs text-muted-foreground">{c.spaces} spaces · {c.reviews} reviews</span>
              </Link>
            </li>
          ))}

        </ul>
      </div>
    </div>
  );
}

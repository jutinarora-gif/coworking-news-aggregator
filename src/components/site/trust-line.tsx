import { ShieldCheck } from "lucide-react";

export function TrustLine({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-start gap-2 text-xs text-muted-foreground ${className}`}>
      <ShieldCheck className="h-3.5 w-3.5 shrink-0 mt-0.5" />
      <span>No paid placement, no seeded reviews. Facts sourced from each operator's own listing.</span>
    </div>
  );
}

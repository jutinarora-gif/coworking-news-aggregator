import { Link } from "@tanstack/react-router";
import { Star, MapPin } from "lucide-react";
import { cardImageUrl } from "@/lib/utils";

export function SpaceCard({ s }: { s: any }) {
  return (
    <Link
      to="/spaces/$slug"
      params={{ slug: s.slug }}
      className="group block glass rounded-2xl overflow-hidden hover-glow hover:hover-glow-hover"
    >
      {s.cover_url && (
        <div className="relative aspect-[16/10] overflow-hidden">
          <img src={cardImageUrl(s.cover_url) ?? undefined} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-xl group-hover:text-muted-foreground transition-colors">{s.name}</h3>
            {s.city_name && (
              <div className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />{s.city_name}
              </div>
            )}
          </div>
          {s.avg_rating != null && (
            <div className="text-right shrink-0">
              <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg glass">
                <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                <span className="text-sm font-medium">{s.avg_rating}</span>
              </div>
              <div className="text-[10px] text-muted-foreground mt-1">{s.review_count} reviews</div>
            </div>
          )}
        </div>
        {s.description && <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{s.description}</p>}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {s.vibe_tags?.slice(0, 2).map((t: string) => (
              <span key={t} className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-border/50 text-muted-foreground">{t}</span>
            ))}
          </div>
          {s.price_from && (
            <div className="text-sm">
              <span className="text-muted-foreground text-xs">from </span>
              <span className="font-medium">{s.currency === "INR" ? "₹" : "$"}{s.price_from.toLocaleString()}</span>
              <span className="text-muted-foreground text-xs">/mo</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

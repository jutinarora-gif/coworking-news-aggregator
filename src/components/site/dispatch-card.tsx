import { Link } from "@tanstack/react-router";
import type { Dispatch } from "@/lib/data.functions";
import { formatDistanceToNow } from "date-fns";

export function DispatchCard({ d, featured = false }: { d: Dispatch; featured?: boolean }) {
  return (
    <Link
      to="/dispatches/$slug"
      params={{ slug: d.slug }}
      className={`group block glass rounded-2xl overflow-hidden hover-glow hover:hover-glow-hover ${featured ? "md:col-span-2" : ""}`}
    >
      {d.cover_url && (
        <div className={`relative overflow-hidden ${featured ? "aspect-[16/8]" : "aspect-[16/10]"}`}>
          <img src={d.cover_url} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          <div className="absolute top-3 left-3 flex gap-2">
            <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-medium ${d.region === "india" ? "bg-primary/90 text-primary-foreground" : "glass text-foreground"}`}>
              {d.region === "india" ? "🇮🇳 India" : "🌏 Global"}
            </span>
            {d.is_featured && <span className="px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider glass-strong text-iris">Featured</span>}
          </div>
        </div>
      )}
      <div className="p-5">
        <div className="text-[11px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <span>{d.source_name}</span>
          <span>·</span>
          <span>{formatDistanceToNow(new Date(d.ingested_at), { addSuffix: true })}</span>
        </div>
        <h3 className={`mt-2 font-display leading-snug group-hover:text-iris transition-colors ${featured ? "text-2xl md:text-3xl" : "text-lg"}`}>
          {d.title}
        </h3>
        {d.excerpt && <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{d.excerpt}</p>}
        {d.tags?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {d.tags.slice(0, 3).map((t) => (
              <span key={t} className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-border/50 text-muted-foreground">{t}</span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

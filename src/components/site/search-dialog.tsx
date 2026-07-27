import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { search } from "@/lib/data.functions";
import { Building2, Newspaper, MessagesSquare } from "lucide-react";

export function SearchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<{ spaces: any[]; dispatches: any[]; questions: any[] }>({ spaces: [], dispatches: [], questions: [] });
  const navigate = useNavigate();

  useEffect(() => {
    if (!q.trim()) { setResults({ spaces: [], dispatches: [], questions: [] }); return; }
    const t = setTimeout(async () => {
      try { setResults(await search({ data: { q } })); } catch {}
    }, 150);
    return () => clearTimeout(t);
  }, [q]);

  const go = (to: string) => { onOpenChange(false); navigate({ to }); };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search spaces, dispatches, questions…" value={q} onValueChange={setQ} />
      <CommandList>
        <CommandEmpty>{q ? "No matches" : "Try 'Awfis', 'Bangalore', or 'Koramangala'"}</CommandEmpty>
        {results.spaces.length > 0 && (
          <CommandGroup heading="Spaces">
            {results.spaces.map((s) => (
              <CommandItem key={s.id} onSelect={() => go(`/spaces/${s.slug}`)}>
                <Building2 className="h-4 w-4 mr-2" />{s.name}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {results.dispatches.length > 0 && (
          <CommandGroup heading="Dispatches">
            {results.dispatches.map((d) => (
              <CommandItem key={d.id} onSelect={() => go(`/dispatches/${d.slug}`)}>
                <Newspaper className="h-4 w-4 mr-2" />{d.title}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {results.questions.length > 0 && (
          <CommandGroup heading="Questions">
            {results.questions.map((q) => (
              <CommandItem key={q.id} onSelect={() => go(`/questions`)}>
                <MessagesSquare className="h-4 w-4 mr-2" />{q.title}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}

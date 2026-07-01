import { Search, Trash2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ThoughtBox from "@/components/ThoughtBox";
import { listThoughts } from "@/lib/queries/thoughts";
import { deleteThought } from "@/lib/actions/thoughts";

export default async function ThoughtsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const thoughts = listThoughts(q);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Thoughts" subtitle="One box. Catch it, done." />

      <ThoughtBox />

      <form className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
        <input
          name="q"
          defaultValue={q}
          className="input pl-9"
          placeholder="Search thoughts…"
        />
      </form>

      {thoughts.length === 0 ? (
        <p className="text-sm text-faint px-1">{q ? "No matches." : "Nothing yet."}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {thoughts.map((t) => (
            <li key={t.id} className="card p-3 flex gap-3">
              <div className="flex-1">
                <div className="text-[11px] text-faint tabular-nums mb-1">
                  {new Date(t.created_at).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <p className="whitespace-pre-wrap text-sm">{t.body}</p>
              </div>
              <form action={deleteThought.bind(null, t.id)}>
                <button className="text-faint p-1" aria-label="Delete thought">
                  <Trash2 size={15} />
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

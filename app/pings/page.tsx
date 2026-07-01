import PageHeader from "@/components/PageHeader";
import { pingBreakdown, recentPings } from "@/lib/queries/pings";
import { dayStartIso, weekStart, dayStr } from "@/lib/date";

const COLOR: Record<string, string> = {
  Work: "var(--info)",
  Nothing: "var(--faint)",
  Scroll: "var(--warn)",
  Play: "var(--accent)",
};

function Breakdown({ title, rows }: { title: string; rows: { answer: string; count: number }[] }) {
  const total = rows.reduce((s, r) => s + r.count, 0);
  return (
    <section className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-muted">{title}</h2>
        <span className="text-xs text-faint">{total} pings</span>
      </div>
      {total === 0 ? (
        <p className="text-sm text-faint">No pings yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {rows.map((r) => (
            <div key={r.answer} className="flex items-center gap-2 text-sm">
              <span className="w-16 text-muted">{r.answer}</span>
              <div className="flex-1 h-4 rounded bg-surface-2 overflow-hidden">
                <div
                  className="h-full rounded"
                  style={{ width: `${(r.count / total) * 100}%`, background: COLOR[r.answer] ?? "var(--muted)" }}
                />
              </div>
              <span className="w-14 text-right tabular-nums text-muted">
                {Math.round((r.count / total) * 100)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function PingsPage() {
  const today = pingBreakdown(dayStartIso(dayStr()));
  const week = pingBreakdown(dayStartIso(weekStart()));
  const recent = recentPings(30);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Time pings" subtitle="Where the time actually went" />
      <Breakdown title="Today" rows={today} />
      <Breakdown title="This week" rows={week} />

      <section>
        <h2 className="text-sm font-semibold text-muted mb-2 px-1">Recent</h2>
        <ul className="flex flex-col gap-1">
          {recent.map((p) => (
            <li key={p.id} className="flex items-center justify-between text-sm px-1 py-1">
              <span style={{ color: COLOR[p.answer] ?? "var(--foreground)" }}>{p.answer}</span>
              <span className="text-xs text-faint tabular-nums">
                {new Date(p.pinged_at).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

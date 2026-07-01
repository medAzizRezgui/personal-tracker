import PageHeader from "@/components/PageHeader";
import GymSessionForm from "@/components/GymSessionForm";
import { recentSessions, pullupProgression, gymRule } from "@/lib/queries/habits";
import { deleteGymSession } from "@/lib/actions/habits";
import { dayStr } from "@/lib/date";
import { Trash2, TrendingUp } from "lucide-react";

const RULE_COLOR: Record<string, string> = {
  green: "var(--accent)",
  warn: "var(--warn)",
  broken: "var(--danger)",
  none: "var(--faint)",
};

export default function GymPage() {
  const today = dayStr();
  const rule = gymRule();
  const sessions = recentSessions();
  const prog = pullupProgression();
  const maxReps = prog.reduce((m, p) => Math.max(m, p.reps), 0) || 1;

  return (
    <>
      <PageHeader title="Gym" subtitle="Sessions & progression" />

      <div className="card p-3 mb-4 flex items-center gap-3">
        <span
          className="inline-block h-3 w-3 rounded-full shrink-0"
          style={{ background: RULE_COLOR[rule.state] }}
        />
        <span className="text-sm">
          <span className="font-medium">No 2 dark days:</span>{" "}
          <span className="text-muted">{rule.message}</span>
        </span>
      </div>

      <div className="mb-5">
        <GymSessionForm today={today} />
      </div>

      {prog.length > 0 && (
        <section className="card p-4 mb-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold mb-3">
            <TrendingUp size={16} className="text-accent" /> Pull-up progression
          </h2>
          <div className="flex flex-col gap-1.5">
            {prog.map((p) => (
              <div key={p.date} className="flex items-center gap-2 text-xs">
                <span className="w-16 text-faint tabular-nums">{p.date.slice(5)}</span>
                <div className="flex-1 h-4 rounded bg-surface-2 overflow-hidden">
                  <div
                    className="h-full rounded"
                    style={{ width: `${(p.reps / maxReps) * 100}%`, background: "var(--accent)" }}
                  />
                </div>
                <span className="w-8 text-right tabular-nums font-medium">{p.reps}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <h2 className="text-sm font-semibold text-muted mb-2 px-1">History</h2>
      {sessions.length === 0 ? (
        <p className="text-sm text-faint px-1">No sessions logged yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {sessions.map((s) => (
            <li key={s.id} className="card p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="font-medium">{s.title || "Session"}</div>
                  <div className="text-xs text-faint tabular-nums">{s.session_date}</div>
                </div>
                <form action={deleteGymSession.bind(null, s.id)}>
                  <button className="text-faint p-1" aria-label="Delete session">
                    <Trash2 size={16} />
                  </button>
                </form>
              </div>
              <ul className="flex flex-col gap-1">
                {s.sets.map((set) => (
                  <li key={set.id} className="flex justify-between text-sm">
                    <span>{set.exercise}</span>
                    <span className="tabular-nums text-muted">
                      {set.weight != null ? `${set.weight}kg` : ""}
                      {set.weight != null && set.reps != null ? " × " : ""}
                      {set.reps != null ? `${set.reps}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
              {s.notes && <p className="text-xs text-faint mt-2">{s.notes}</p>}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

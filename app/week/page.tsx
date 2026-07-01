import { Dumbbell, Cannabis, ShieldCheck, CheckCircle2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import CopyButton from "@/components/CopyButton";
import { weekSummary, standupText } from "@/lib/queries/week";

function Stat({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="card p-4 min-w-0">
      <div className="flex items-center gap-2 text-muted text-sm">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold tabular-nums break-words" style={{ color }}>
        {value}
      </div>
      {sub && <div className="text-xs text-faint mt-0.5">{sub}</div>}
    </div>
  );
}

export default function WeekPage() {
  const s = weekSummary();
  const standup = standupText(s);
  const fromLabel = new Date(s.from + "T00:00").toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  const pingTotal = s.pings.reduce((t, p) => t + p.count, 0);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="This week" subtitle={`Since ${fromLabel} — what actually moved`} />

      <div className="grid grid-cols-2 gap-3">
        <Stat
          icon={<Dumbbell size={16} />}
          label="Gym"
          value={`${s.gym.sessions}`}
          sub={s.gym.bestPullups > 0 ? `${s.gym.bestPullups} pull-ups best` : "sessions"}
          color="var(--accent)"
        />
        <Stat
          icon={<ShieldCheck size={16} />}
          label="Gym rule"
          value={s.gymRule.kept ? "Kept" : "Broken"}
          sub={s.gymRule.message}
          color={s.gymRule.kept ? "var(--accent)" : "var(--danger)"}
        />
        <Stat
          icon={<Cannabis size={16} />}
          label="Weed"
          value={`${s.weed.count}`}
          sub={`longest gap ${s.weed.longestGapDays}d`}
        />
        <Stat
          icon={<CheckCircle2 size={16} />}
          label="Porn streak"
          value={s.porn.current === null ? "—" : `${s.porn.current}d`}
          sub={`best ${s.porn.best}d`}
          color="var(--accent)"
        />
      </div>

      <section className="card p-4">
        <h2 className="text-sm font-semibold text-muted mb-3">Closed this week</h2>
        {s.closedTickets.length === 0 ? (
          <p className="text-sm text-faint">Nothing stamped yet — use “Done for the day” on Work.</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {s.closedTickets.map((t) => (
              <li key={t.key} className="text-sm">
                <span className="text-info font-semibold tabular-nums">{t.key}</span>{" "}
                <span className="text-muted">{t.summary}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-muted">Standup draft</h2>
          <CopyButton text={standup} />
        </div>
        <pre className="text-sm whitespace-pre-wrap font-sans text-foreground">{standup}</pre>
      </section>

      {pingTotal > 0 && (
        <section className="card p-4">
          <h2 className="text-sm font-semibold text-muted mb-3">Where time went ({pingTotal} pings)</h2>
          <div className="flex flex-col gap-2">
            {s.pings.map((p) => (
              <div key={p.answer} className="flex items-center gap-2 text-sm">
                <span className="w-16 text-muted">{p.answer}</span>
                <div className="flex-1 h-3 rounded bg-surface-2 overflow-hidden">
                  <div
                    className="h-full rounded"
                    style={{ width: `${(p.count / pingTotal) * 100}%`, background: "var(--info)" }}
                  />
                </div>
                <span className="w-10 text-right tabular-nums text-muted">
                  {Math.round((p.count / pingTotal) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

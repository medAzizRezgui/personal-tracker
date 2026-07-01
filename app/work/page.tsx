import { AlertCircle, Settings2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import TicketPicker from "@/components/TicketPicker";
import { fetchTodayTickets } from "@/lib/jira";
import { todaysWorkSession } from "@/lib/queries/work";

export const dynamic = "force-dynamic";

export default async function WorkPage() {
  const result = await fetchTodayTickets();
  const today = todaysWorkSession();
  const stoppedAt = today
    ? new Date(today.stopped_at).toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Work" subtitle="Pick today's tickets, then stop" />

      {today && (
        <div className="card p-4" style={{ borderColor: "var(--accent)" }}>
          <div className="text-sm font-medium text-accent">Stopped at {stoppedAt}</div>
          <ul className="mt-2 flex flex-col gap-1">
            {today.tickets.map((t) => (
              <li key={t.ticket_key} className="text-sm">
                <span className="text-info font-semibold tabular-nums">{t.ticket_key}</span>{" "}
                <span className="text-muted">{t.ticket_summary}</span>
              </li>
            ))}
            {today.tickets.length === 0 && (
              <li className="text-sm text-faint">No tickets stamped.</li>
            )}
          </ul>
        </div>
      )}

      {!result.ok && !result.configured && (
        <div className="card p-4 flex gap-3">
          <Settings2 size={20} className="text-warn shrink-0" />
          <div className="text-sm">
            <div className="font-medium mb-1">Jira not configured</div>
            <p className="text-muted mb-2">Add these to a local <code>.env.local</code>:</p>
            <pre className="text-xs bg-surface-2 rounded-lg p-3 whitespace-pre-wrap break-all text-muted">{`JIRA_BASE_URL=https://spendnetwork.atlassian.net
JIRA_EMAIL=you@example.com
JIRA_API_TOKEN=your_api_token
JIRA_PROJECT=DB`}</pre>
            <p className="text-faint text-xs mt-2">
              Create a token at id.atlassian.com → Security → API tokens, then restart the dev server.
            </p>
          </div>
        </div>
      )}

      {!result.ok && result.configured && (
        <div className="card p-4 flex gap-3">
          <AlertCircle size={20} className="text-danger shrink-0" />
          <div className="text-sm">
            <div className="font-medium mb-1">Couldn&apos;t reach Jira</div>
            <p className="text-muted break-words">{result.error}</p>
          </div>
        </div>
      )}

      {result.ok && result.tickets.length === 0 && (
        <p className="text-sm text-faint px-1">No open tickets assigned to you right now.</p>
      )}

      {result.ok && result.tickets.length > 0 && (
        <TicketPicker
          tickets={result.tickets}
          preselected={today ? today.tickets.map((t) => t.ticket_key) : []}
        />
      )}
    </div>
  );
}

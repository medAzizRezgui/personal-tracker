// Jira Cloud integration. Creds come from local env only (never hardcoded).
// Uses the current enhanced search endpoint POST /rest/api/3/search/jql
// (the old /rest/api/3/search was removed — returns 410).

export type JiraTicket = {
  key: string;
  summary: string;
  status: string;
  statusCategory: string; // "new" | "indeterminate" | "done"
  url: string;
};

export type JiraResult =
  | { ok: true; tickets: JiraTicket[] }
  | { ok: false; configured: boolean; error: string };

function config() {
  const baseUrl = process.env.JIRA_BASE_URL?.replace(/\/$/, "");
  const email = process.env.JIRA_EMAIL;
  const token = process.env.JIRA_API_TOKEN;
  const project = process.env.JIRA_PROJECT || "DB";
  return { baseUrl, email, token, project };
}

export function jiraConfigured(): boolean {
  const { baseUrl, email, token } = config();
  return Boolean(baseUrl && email && token);
}

export async function fetchTodayTickets(): Promise<JiraResult> {
  const { baseUrl, email, token, project } = config();
  if (!baseUrl || !email || !token) {
    return { ok: false, configured: false, error: "Jira not configured" };
  }

  const jql = `project = ${project} AND assignee = currentUser() AND statusCategory != Done ORDER BY updated DESC`;
  const auth = Buffer.from(`${email}:${token}`).toString("base64");

  try {
    const res = await fetch(`${baseUrl}/rest/api/3/search/jql`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ jql, fields: ["summary", "status"], maxResults: 50 }),
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      return { ok: false, configured: true, error: `Jira ${res.status}: ${text.slice(0, 200)}` };
    }

    const data = (await res.json()) as {
      issues?: {
        key: string;
        fields: { summary: string; status: { name: string; statusCategory: { key: string } } };
      }[];
    };

    const tickets: JiraTicket[] = (data.issues ?? []).map((i) => ({
      key: i.key,
      summary: i.fields.summary,
      status: i.fields.status?.name ?? "",
      statusCategory: i.fields.status?.statusCategory?.key ?? "new",
      url: `${baseUrl}/browse/${i.key}`,
    }));

    return { ok: true, tickets };
  } catch (e) {
    return { ok: false, configured: true, error: e instanceof Error ? e.message : "fetch failed" };
  }
}

import { Archive, ArchiveRestore, Trash2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import GoalForm from "@/components/GoalForm";
import { listGoals } from "@/lib/queries/goals";
import { archiveGoal, unarchiveGoal, deleteGoal } from "@/lib/actions/goals";

export default function GoalsPage() {
  const { active, archived } = listGoals();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Goals" subtitle="A holding pen, each with a why" />

      <GoalForm />

      {active.length === 0 ? (
        <p className="text-sm text-faint px-1">No goals yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {active.map((g) => (
            <li key={g.id} className="card p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="font-medium">{g.title}</div>
                  {g.why && <p className="text-sm text-muted mt-1">{g.why}</p>}
                </div>
                <form action={archiveGoal.bind(null, g.id)}>
                  <button className="text-faint p-1" aria-label="Archive goal">
                    <Archive size={16} />
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      {archived.length > 0 && (
        <details className="mt-2">
          <summary className="text-sm text-faint cursor-pointer px-1">
            Archived ({archived.length})
          </summary>
          <ul className="flex flex-col gap-2 mt-2">
            {archived.map((g) => (
              <li key={g.id} className="card p-3 flex items-center gap-2">
                <span className="flex-1 text-sm text-muted">{g.title}</span>
                <form action={unarchiveGoal.bind(null, g.id)}>
                  <button className="text-faint p-1" aria-label="Restore goal">
                    <ArchiveRestore size={15} />
                  </button>
                </form>
                <form action={deleteGoal.bind(null, g.id)}>
                  <button className="text-faint p-1" aria-label="Delete goal">
                    <Trash2 size={15} />
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

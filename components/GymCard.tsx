import Link from "next/link";
import { Dumbbell, ChevronRight } from "lucide-react";
import type { GymRule } from "@/lib/queries/habits";

const RULE_COLOR: Record<string, string> = {
  green: "var(--accent)",
  warn: "var(--warn)",
  broken: "var(--danger)",
  none: "var(--faint)",
};

export default function GymCard({ rule }: { rule: GymRule }) {
  return (
    <Link href="/gym" className="card p-4 flex items-center gap-3">
      <span
        className="grid h-10 w-10 place-items-center rounded-full shrink-0"
        style={{ background: "var(--surface-2)", color: RULE_COLOR[rule.state] }}
      >
        <Dumbbell size={20} />
      </span>
      <div className="flex-1">
        <div className="text-sm font-medium text-muted">Gym · no 2 dark days</div>
        <div className="font-medium" style={{ color: RULE_COLOR[rule.state] }}>
          {rule.message}
        </div>
      </div>
      <ChevronRight size={18} className="text-faint" />
    </Link>
  );
}

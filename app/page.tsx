import Link from "next/link";
import { Briefcase, ChevronRight } from "lucide-react";
import RoutineChecklist from "@/components/RoutineChecklist";
import DailyNote from "@/components/DailyNote";
import WeedCard from "@/components/WeedCard";
import PornCard from "@/components/PornCard";
import GymCard from "@/components/GymCard";
import { routineForDay, dailyNote } from "@/lib/queries/today";
import { weedStatus, pornStatus, gymRule } from "@/lib/queries/habits";
import { todaysWorkSession } from "@/lib/queries/work";
import { dayStr } from "@/lib/date";

export default function TodayPage() {
  const day = dayStr();
  const items = routineForDay(day);
  const note = dailyNote(day);
  const weed = weedStatus();
  const porn = pornStatus();
  const rule = gymRule();
  const work = todaysWorkSession(day);

  const heading = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="flex flex-col gap-4">
      <header className="pt-1">
        <p className="text-sm text-faint">{heading}</p>
        <h1 className="text-2xl font-semibold tracking-tight">Today</h1>
      </header>

      <RoutineChecklist items={items} day={day} />
      <DailyNote day={day} initial={note} />

      <div className="grid grid-cols-2 gap-3">
        <WeedCard status={weed} />
        <PornCard status={porn} />
      </div>
      <GymCard rule={rule} />

      <Link href="/work" className="card p-4 flex items-start gap-3">
        <Briefcase size={20} className="text-info mt-0.5 shrink-0" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="font-medium">Today&apos;s work</span>
            <ChevronRight size={18} className="text-faint" />
          </div>
          {work && work.tickets.length > 0 ? (
            <ul className="mt-1 flex flex-col gap-0.5">
              {work.tickets.map((t) => (
                <li key={t.ticket_key} className="text-sm text-muted">
                  <span className="text-info font-semibold tabular-nums">{t.ticket_key}</span>{" "}
                  {t.ticket_summary}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-faint mt-0.5">Pick today&apos;s tickets →</p>
          )}
        </div>
      </Link>
    </div>
  );
}

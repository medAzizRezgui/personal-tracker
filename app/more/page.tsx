import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { Target, NotebookPen, Timer, ChevronRight } from "lucide-react";

const LINKS = [
  { href: "/goals", label: "Goals", icon: Target, desc: "Far-off goals, each with a why" },
  { href: "/thoughts", label: "Thoughts", icon: NotebookPen, desc: "Timestamped dump, searchable" },
  { href: "/pings", label: "Time pings", icon: Timer, desc: "Where the time actually went" },
];

export default function MorePage() {
  return (
    <>
      <PageHeader title="More" />
      <ul className="flex flex-col gap-2">
        {LINKS.map(({ href, label, icon: Icon, desc }) => (
          <li key={href}>
            <Link href={href} className="card flex items-center gap-3 p-4">
              <Icon size={22} className="text-accent" />
              <div className="flex-1">
                <div className="font-medium">{label}</div>
                <div className="text-xs text-muted">{desc}</div>
              </div>
              <ChevronRight size={18} className="text-faint" />
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

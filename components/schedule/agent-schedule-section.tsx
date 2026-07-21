import { CalendarDays } from "lucide-react";
import AgentScheduleForm from "@/app/dashboard/agent/components/agent-schedule-form";

interface AgentScheduleSectionProps {
  schedules: any[];
  scheduleUnits: { id: number; title: string }[];
  pendingTourCountByUnit: Record<number, number>;
}

export default function AgentScheduleSection({
  schedules,
  scheduleUnits,
  pendingTourCountByUnit,
}: AgentScheduleSectionProps) {
  return (
    <section>
      <SectionTitle icon={<CalendarDays className="w-4 h-4 text-blue-400" />}>My Schedule</SectionTitle>

      {schedules.length === 0 ? (
        <EmptyState message="No upcoming schedules." />
      ) : (
        <div className="bg-[#1e293b] border border-slate-700 rounded-xl divide-y divide-slate-700 overflow-hidden mb-4">
          {schedules.map((s: any) => (
            <div key={s.id} className="px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <p className="font-medium text-sm text-white truncate">{s.title}</p>
                  {s.sourceScheduleId && (
                    <span className="flex-shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400">
                      🔗 From Tour Request
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400 flex-shrink-0">
                  {new Date(s.date).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              {s.unit && <p className="text-xs text-slate-400 mt-0.5">{s.unit.title}</p>}
              {s.memo && <p className="text-xs text-slate-400 mt-1">{s.memo}</p>}
            </div>
          ))}
        </div>
      )}

      <AgentScheduleForm units={scheduleUnits} pendingTourCountByUnit={pendingTourCountByUnit} />
    </section>
  );
}

function SectionTitle({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      {icon}
      <h2 className="text-sm font-bold text-white uppercase tracking-wide">{children}</h2>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-20 border border-dashed border-slate-700 rounded-xl text-sm text-slate-400 mb-4">
      {message}
    </div>
  );
}

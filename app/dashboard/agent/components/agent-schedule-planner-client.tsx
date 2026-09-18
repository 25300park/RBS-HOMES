"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  CalendarDays, 
  Clock, 
  Building2, 
  Plus, 
  Loader2, 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  List,
  AlertCircle
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";

export interface ScheduleItem {
  id: number;
  title: string;
  date: string;
  memo?: string | null;
  status: number;
  sourceScheduleId?: number | null;
  unitId?: number | null;
  unit?: {
    id: number;
    title: string;
  } | null;
}

interface AgentSchedulePlannerClientProps {
  initialSchedules: ScheduleItem[];
  units: { id: number; title: string }[];
  pendingTourCountByUnit?: Record<number, number>;
}

// Generate 30-minute time intervals from 07:00 AM to 09:00 PM
const TIME_SLOTS: { value: string; label: string }[] = [];
for (let hour = 7; hour <= 21; hour++) {
  for (const minute of ["00", "30"]) {
    if (hour === 21 && minute === "30") break;
    const hourStr = hour.toString().padStart(2, "0");
    const val = `${hourStr}:${minute}`;
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    const label = `${displayHour.toString().padStart(2, "0")}:${minute} ${period}`;
    TIME_SLOTS.push({ value: val, label });
  }
}

export default function AgentSchedulePlannerClient({
  initialSchedules,
  units,
  pendingTourCountByUnit = {}
}: AgentSchedulePlannerClientProps) {
  const router = useRouter();
  const [schedules, setSchedules] = useState<ScheduleItem[]>(initialSchedules);
  
  // View Modes: "calendar" (월간 달력) | "timeline" (타임라인 목록)
  const [viewMode, setViewMode] = useState<"calendar" | "timeline">("calendar");

  // Calendar State
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Form State (Date + 30-min Slot Time)
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const [title, setTitle] = useState("");
  const [formDate, setFormDate] = useState(todayStr);
  const [formTime, setFormTime] = useState("10:00");
  const [unitId, setUnitId] = useState("");
  const [memo, setMemo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // When user clicks a calendar cell, sync formDate with selectedDate
  const handleSelectCalendarDate = (date: Date) => {
    setSelectedDate(date);
    setFormDate(format(date, "yyyy-MM-dd"));
  };

  // Filter schedules for the selected date in calendar view
  const schedulesOnSelectedDate = useMemo(() => {
    return schedules.filter(s => isSameDay(new Date(s.date), selectedDate))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [schedules, selectedDate]);

  // All schedules sorted for timeline view
  const sortedTimelineSchedules = useMemo(() => {
    return [...schedules].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [schedules]);

  // Calendar Grid Days Calculation
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const days: Date[] = [];
    let day = startDate;
    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentMonth]);

  // Map schedules by date string (YYYY-MM-DD) for fast lookup in calendar
  const schedulesByDateMap = useMemo(() => {
    const map = new Map<string, ScheduleItem[]>();
    schedules.forEach(s => {
      const dateKey = format(new Date(s.date), "yyyy-MM-dd");
      const list = map.get(dateKey) || [];
      list.push(s);
      map.set(dateKey, list);
    });
    return map;
  }, [schedules]);

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !formDate || !formTime) {
      setError("Please enter a title, date, and 30-minute time slot.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    const combinedDateTime = `${formDate}T${formTime}:00`;

    try {
      const res = await fetch("/api/pms/agent-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          date: combinedDateTime,
          unitId: unitId ? Number(unitId) : undefined,
          memo: memo.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to add schedule.");
      }

      setTitle("");
      setMemo("");
      setUnitId("");
      setSuccessMsg("Schedule added successfully!");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to save schedule.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Top Controls: View Mode Switcher + Tour Requests Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200/80">
        
        {/* View Switcher Tabs (Balanced full-width on mobile, auto-width on desktop) */}
        <div className="flex items-center gap-1.5 bg-zinc-100 p-1.5 rounded-2xl w-full sm:w-auto shadow-inner">
          <button
            type="button"
            onClick={() => setViewMode("calendar")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 sm:py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === "calendar"
                ? "bg-white text-blue-600 shadow-sm font-black"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Monthly Calendar</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("timeline")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 sm:py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === "timeline"
                ? "bg-white text-blue-600 shadow-sm font-black"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            <List className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Timeline List</span>
          </button>
        </div>

        {/* Quick Links (Full-width centered button on mobile) */}
        <div className="w-full sm:w-auto">
          <Link
            href="/dashboard/agent/tour-requests"
            className="w-full sm:w-auto text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1.5 bg-blue-50 hover:bg-blue-100/70 px-4 py-2 sm:py-1.5 rounded-xl border border-blue-200/80 transition-colors shadow-2xs"
          >
            <AlertCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>View Tour Requests Queue →</span>
          </Link>
        </div>

      </div>

      {/* ── MODE 1: MONTHLY CALENDAR VIEW ── */}
      {viewMode === "calendar" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Calendar Grid (8 Cols) */}
          <div className="lg:col-span-8 bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-zinc-200/80 space-y-4">
            
            {/* Calendar Header with Prev / Next / Today */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <h2 className="text-base sm:text-lg font-black text-zinc-900">
                  {format(currentMonth, "MMMM yyyy")}
                </h2>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentMonth(new Date())}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                  aria-label="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                  aria-label="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Weekday Labels (Sun ~ Sat) */}
            <div className="grid grid-cols-7 text-center font-black text-[11px] text-zinc-400 uppercase tracking-wider py-1 select-none">
              <span className="text-rose-500">Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span className="text-blue-600">Sat</span>
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5 border-t border-zinc-100 pt-1.5">
              {calendarDays.map((dayDate, idx) => {
                const isCurrentMonthDay = isSameMonth(dayDate, currentMonth);
                const isToday = isSameDay(dayDate, new Date());
                const isSelected = isSameDay(dayDate, selectedDate);
                const dateKey = format(dayDate, "yyyy-MM-dd");
                const daySchedules = schedulesByDateMap.get(dateKey) || [];

                return (
                  <div
                    key={idx}
                    onClick={() => handleSelectCalendarDate(dayDate)}
                    className={`min-h-[82px] sm:min-h-[96px] p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "bg-blue-50/70 border-blue-500 shadow-xs ring-2 ring-blue-400/30"
                        : isCurrentMonthDay
                        ? "bg-[#f8fafc]/70 hover:bg-white hover:border-zinc-300 border-zinc-200/60"
                        : "bg-zinc-50/30 border-transparent opacity-40 hover:opacity-70"
                    }`}
                  >
                    {/* Day Number Header */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-black inline-flex items-center justify-center w-5 h-5 rounded-full ${
                          isToday
                            ? "bg-blue-600 text-white shadow-2xs"
                            : isSelected
                            ? "text-blue-700"
                            : isCurrentMonthDay
                            ? "text-zinc-800"
                            : "text-zinc-400"
                        }`}
                      >
                        {format(dayDate, "d")}
                      </span>

                      {daySchedules.length > 0 && (
                        <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700">
                          {daySchedules.length}
                        </span>
                      )}
                    </div>

                    {/* Schedule Event Pills inside Day Cell */}
                    <div className="space-y-1 mt-1 overflow-hidden">
                      {daySchedules.slice(0, 2).map((s) => {
                        const timeStr = format(new Date(s.date), "HH:mm");
                        return (
                          <div
                            key={s.id}
                            className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded truncate border leading-tight ${
                              s.sourceScheduleId
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-emerald-50 text-emerald-800 border-emerald-200"
                            }`}
                            title={`${timeStr} - ${s.title}`}
                          >
                            <span className="font-mono">{timeStr}</span> {s.title}
                          </div>
                        );
                      })}
                      {daySchedules.length > 2 && (
                        <span className="text-[9px] font-bold text-zinc-500 block text-right">
                          +{daySchedules.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Right Column: Selected Date Schedule Details + Quick Add Form (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Selected Date Summary Card */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-zinc-200/80 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-black text-zinc-900 uppercase tracking-wider">
                    {format(selectedDate, "EEE, MMM d, yyyy")}
                  </h3>
                </div>
                <span className="text-xs font-bold text-zinc-500">
                  {schedulesOnSelectedDate.length} Meetings
                </span>
              </div>

              {schedulesOnSelectedDate.length === 0 ? (
                <p className="text-xs text-zinc-400 font-medium py-3 text-center bg-zinc-50 rounded-xl">
                  No appointments on this date.
                </p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {schedulesOnSelectedDate.map((s) => (
                    <div
                      key={s.id}
                      className="p-2.5 rounded-xl bg-[#f8fafc] border border-zinc-200/80 space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-extrabold text-blue-700 font-mono">
                          {format(new Date(s.date), "hh:mm a")}
                        </span>
                        {s.sourceScheduleId && (
                          <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800">
                            Tour
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-zinc-900 truncate">{s.title}</h4>
                      {s.unit && (
                        <p className="text-[11px] text-zinc-500 truncate">📍 {s.unit.title}</p>
                      )}
                      {s.memo && (
                        <p className="text-[11px] text-zinc-400 italic">💬 {s.memo}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Add Schedule Form */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-zinc-200/80 space-y-3.5">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-100">
                <Plus className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wider">
                  Add Schedule to Date
                </h4>
              </div>

              <form onSubmit={handleAddSchedule} className="space-y-3">
                
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                    Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Unit inspection with client"
                    className="w-full text-xs font-bold bg-[#f8fafc] border border-zinc-200/90 rounded-xl px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                      Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full text-xs font-bold bg-[#f8fafc] border border-zinc-200/90 rounded-xl px-2.5 py-2 text-zinc-900 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                      Time Slot <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formTime}
                      onChange={(e) => setFormTime(e.target.value)}
                      className="w-full text-xs font-bold bg-[#f8fafc] border border-zinc-200/90 rounded-xl px-2 py-2 text-zinc-900 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                    >
                      {TIME_SLOTS.map((slot) => (
                        <option key={slot.value} value={slot.value}>
                          {slot.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                    Listing <span className="text-zinc-400 font-normal">(optional)</span>
                  </label>
                  <select
                    value={unitId}
                    onChange={(e) => setUnitId(e.target.value)}
                    className="w-full text-xs font-bold bg-[#f8fafc] border border-zinc-200/90 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">None (General Meeting)</option>
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                    Notes <span className="text-zinc-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    rows={2}
                    placeholder="Key notes..."
                    className="w-full text-xs font-medium bg-[#f8fafc] border border-zinc-200/90 rounded-xl px-3 py-1.5 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                  />
                </div>

                {error && <p className="text-xs font-bold text-rose-600">{error}</p>}
                {successMsg && <p className="text-xs font-bold text-emerald-600">{successMsg}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-md shadow-blue-600/20 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Save to Schedule</span>
                </button>
              </form>
            </div>

          </div>

        </div>
      )}

      {/* ── MODE 2: TIMELINE LIST VIEW ── */}
      {viewMode === "timeline" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-zinc-200/80 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-blue-600" />
                <h3 className="text-base font-extrabold text-zinc-900">All Scheduled Appointments</h3>
              </div>
              <span className="text-xs font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                {sortedTimelineSchedules.length} Items
              </span>
            </div>

            {sortedTimelineSchedules.length === 0 ? (
              <p className="text-xs text-zinc-400 py-8 text-center bg-[#f8fafc] rounded-xl border border-dashed border-zinc-200">
                No appointments found.
              </p>
            ) : (
              <div className="space-y-3">
                {sortedTimelineSchedules.map((s) => (
                  <div
                    key={s.id}
                    className="p-4 rounded-xl bg-[#f8fafc] hover:bg-white hover:shadow-sm border border-zinc-200/80 hover:border-blue-300 transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm text-zinc-900">{s.title}</h4>
                          {s.sourceScheduleId && (
                            <span className="bg-blue-50 text-blue-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-blue-200">
                              🔗 Tour Request
                            </span>
                          )}
                        </div>
                        {s.unit && (
                          <p className="text-xs text-zinc-600 font-bold mt-1">📍 {s.unit.title}</p>
                        )}
                        {s.memo && <p className="text-xs text-zinc-400 mt-1">💬 {s.memo}</p>}
                      </div>
                      <div className="text-right shrink-0 bg-white p-2 rounded-xl border border-zinc-200/70">
                        <span className="text-xs font-black text-blue-600 block">
                          {format(new Date(s.date), "hh:mm a")}
                        </span>
                        <span className="text-[10px] font-bold text-zinc-500 block">
                          {format(new Date(s.date), "EEE, MMM d")}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form in Timeline View */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-zinc-200/80 space-y-4 sticky top-24">
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-100">
              <Plus className="w-4 h-4 text-blue-600" />
              <h3 className="text-base font-extrabold text-zinc-900">Add New Schedule</h3>
            </div>

            <form onSubmit={handleAddSchedule} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Title <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Unit inspection with Mr. Tan"
                  className="w-full text-xs font-bold bg-[#f8fafc] border border-zinc-200/90 rounded-xl px-3.5 py-2.5 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Date <span className="text-rose-500">*</span></label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full text-xs font-bold bg-[#f8fafc] border border-zinc-200/90 rounded-xl px-3 py-2.5 text-zinc-900 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Time (30m Slot) <span className="text-rose-500">*</span></label>
                  <select
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full text-xs font-bold bg-[#f8fafc] border border-zinc-200/90 rounded-xl px-3 py-2.5 text-zinc-900 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot.value} value={slot.value}>{slot.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Related Listing <span className="text-zinc-400 font-normal">(optional)</span></label>
                <select
                  value={unitId}
                  onChange={(e) => setUnitId(e.target.value)}
                  className="w-full text-xs font-bold bg-[#f8fafc] border border-zinc-200/90 rounded-xl px-3 py-2.5 text-zinc-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">None (General Meeting)</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>{u.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Notes <span className="text-zinc-400 font-normal">(optional)</span></label>
                <textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  rows={2}
                  placeholder="Key discussion points, client contact..."
                  className="w-full text-xs font-medium bg-[#f8fafc] border border-zinc-200/90 rounded-xl px-3.5 py-2 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />
              </div>

              {error && <p className="text-xs font-bold text-rose-600">{error}</p>}
              {successMsg && <p className="text-xs font-bold text-emerald-600">{successMsg}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl shadow-md shadow-blue-600/20 flex items-center justify-center gap-1.5 transition-all active:scale-98 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                <span>Save to Schedule</span>
              </button>
            </form>
          </div>

        </div>
      )}

    </div>
  );
}

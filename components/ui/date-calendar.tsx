"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useModalStore } from "@/store/use-modal-store";
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
  addWeeks,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  CalendarPlus,
  PencilIcon,
  TrashIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { deleteSchedule, updateSchedule } from "@/app/(route)/account/action";
import { ConfirmDialog } from "./confirm-dialog";

interface Schedule {
  id: number;
  date: Date;
  message: string;
  unitId: number;
  desc: string;
  title: string;
  startedAt?: Date;
  endedAt?: Date;
  regId: number | null;
}

interface UnitDetail {
  unitId: number;
  data: any;
}

interface DateCalendarProps {
  markedDates: any;
  schedules: any;
  fetchUnitDetails: (unitId: number) => Promise<any>;
}

const formatPrice = (price: number | string) => {
  return `₱ ${Number(price).toLocaleString("en-US")}`;
};

const ScheduleCard = ({
  schedule,
  unitDetail,
  showDate = false,
}: {
  schedule: Schedule;
  unitDetail?: UnitDetail;
  showDate?: boolean;
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const { openModal } = useModalStore();
  const startTime = schedule.startedAt
    ? format(new Date(schedule.startedAt), "HH:mm")
    : null;
  const endTime = schedule.endedAt
    ? format(new Date(schedule.endedAt), "HH:mm")
    : null;
  const isAllDay = (!startTime || startTime == "00:00") && endTime == "23:59";

  const canModify = !schedule.regId;

  const handleEdit = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canModify) return;

    // 수정모드로 ScheduleModal 열기
    openModal("schedule", {
      mode: "edit",
      scheduleData: {
        id: schedule.id,
        title: schedule.title,
        desc: schedule.desc,
        date: new Date(schedule.date),
        startedAt: schedule.startedAt
          ? new Date(schedule.startedAt)
          : undefined,
        endedAt: schedule.endedAt ? new Date(schedule.endedAt) : undefined,
        unitId: schedule.unitId,
      },
    });
  };

  const handleUnitClick = (e: React.MouseEvent, unitId: number) => {
    e.stopPropagation();
    const url = `/unit/detail/${unitId}`;
    if (window.innerWidth > 768) {
      window.open(url, "_blank");
    } else {
      router.push(url);
    }
  };

  return (
    <div className="rounded-lg border overflow-hidden bg-white shadow-sm">
      <div className="p-3 bg-gradient-to-r from-orange-50 to-orange-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {showDate && ( // 날짜 표시 추가
              <span className="text-xs px-2 py-0.5 bg-orange-300 text-orange-800 rounded-full">
                {format(new Date(schedule.date), "MMM d")}
              </span>
            )}
            {isAllDay ? (
              <span className="text-xs px-2 py-0.5 bg-orange-200 text-orange-700 rounded-full">
                All Day
              </span>
            ) : (
              <span className="text-sm text-orange-700">
                {startTime} - {endTime}
              </span>
            )}
          </div>

          {canModify && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleEdit}
                className="p-1.5 hover:bg-orange-200 rounded-full transition-colors"
              >
                <PencilIcon className="w-4 h-4 text-orange-600" />
              </button>

              <ConfirmDialog
                title="Delete Schedule"
                description="Are you sure you want to delete this schedule?"
                confirmText="Delete"
                onConfirm={async () => {
                  try {
                    const result = await deleteSchedule(schedule.id);

                    toast({
                      title: result.status === 200 ? "Success" : "Error",
                      description: result.message,
                      variant:
                        result.status === 200 ? "default" : "destructive",
                    });

                    if (result.status === 200) {
                      router.refresh();
                    }
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: "Failed to delete schedule",
                      variant: "destructive",
                    });
                  }
                }}
                triggerVariant="ghost"
              >
                <div className="p-1.5 hover:bg-orange-200 rounded-full transition-colors cursor-pointer">
                  <TrashIcon className="w-4 h-4 text-orange-600" />
                </div>
              </ConfirmDialog>
            </div>
          )}
        </div>
        <h4 className="font-medium text-gray-900">{schedule.title}</h4>
        {schedule.desc && (
          <p className="text-sm text-gray-600 mt-1">{schedule.desc}</p>
        )}
      </div>

      {unitDetail && (
        <div
          className="p-3 border-t bg-white hover:bg-gray-50 cursor-pointer transition-colors"
          onClick={(e) => handleUnitClick(e, unitDetail.unitId)}
        >
          <div className="flex gap-3">
            <img
              src={JSON.parse(unitDetail.data.images)[0]}
              alt="Unit"
              className="w-20 h-20 object-cover rounded-md"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 truncate">
                {unitDetail.data.title}
              </h4>
              <p className="text-sm text-gray-600 mt-1 truncate">
                {unitDetail.data.fullAdress}
              </p>
              <p className="text-sm font-medium text-orange-600 mt-1">
                {formatPrice(unitDetail.data.price)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ScheduleDisplay = ({
  schedules,
  unitDetails,
  title,
  className = "",
  maxHeight = "",
  showDate = false,
}: {
  schedules: Schedule[];
  unitDetails: UnitDetail[];
  title: string;
  className?: string;
  maxHeight?: string;
  showDate?: boolean;
}) => {
  const sortedSchedules = [...schedules].sort((a, b) => {
    const aTime = a.startedAt ? new Date(a.startedAt) : new Date(a.date);
    const bTime = b.startedAt ? new Date(b.startedAt) : new Date(b.date);

    if (!a.startedAt && b.startedAt) return -1;
    if (a.startedAt && !b.startedAt) return 1;
    return aTime.getTime() - bTime.getTime();
  });

  return (
    <div className={`bg-white rounded-lg  md:p-0 w-full ${className}`}>
      <h3 className="text-lg font-semibold border-b pb-2 sticky top-0 bg-white">
        {title}
      </h3>
      <div className={`mt-4 space-y-4 overflow-y-auto ${maxHeight}`}>
        {sortedSchedules.length > 0 ? (
          sortedSchedules.map((schedule) => (
            <ScheduleCard
              key={schedule.id}
              schedule={schedule}
              unitDetail={unitDetails.find(
                (unit) => unit.unitId === schedule.unitId
              )}
              showDate={showDate}
            />
          ))
        ) : (
          <p className="text-gray-500">No schedules available.</p>
        )}
      </div>
    </div>
  );
};

const DateCalendar: React.FC<DateCalendarProps> = ({
  markedDates,
  schedules,
  fetchUnitDetails,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSchedules, setSelectedSchedules] = useState<Schedule[]>([]);
  const [unitDetails, setUnitDetails] = useState<UnitDetail[]>([]);
  const [upcomingSchedules, setUpcomingSchedules] = useState<Schedule[]>([]);
  const [upcomingUnitDetails, setUpcomingUnitDetails] = useState<UnitDetail[]>(
    []
  );
  const { openModal } = useModalStore();

  useEffect(() => {
    const today = new Date();
    onDateClick(
      today,
      schedules.filter((schedule: any) =>
        isSameDay(new Date(schedule.date), today)
      )
    );

    const nextWeek = addWeeks(today, 1);
    const upcoming = schedules.filter(
      (schedule: Schedule) =>
        new Date(schedule.date) >= today && new Date(schedule.date) <= nextWeek
    );

    setUpcomingSchedules(upcoming);

    const unitPromises = upcoming
      .filter((schedule: any) => schedule.unitId !== -1)
      .map((schedule: any) =>
        fetchUnitDetails(schedule.unitId).then((data) => ({
          unitId: schedule.unitId,
          data,
        }))
      );

    Promise.all(unitPromises)
      .then(setUpcomingUnitDetails)
      .catch((error) =>
        console.error("Failed to fetch upcoming unit details:", error)
      );
  }, [schedules, fetchUnitDetails]);

  const onDateClick = async (day: Date, daySchedules: Schedule[]) => {
    setSelectedDate(day);
    setSelectedSchedules(daySchedules);

    const unitPromises = daySchedules
      .filter((schedule) => schedule.unitId !== -1)
      .map((schedule) =>
        fetchUnitDetails(schedule.unitId).then((data) => ({
          unitId: schedule.unitId,
          data,
        }))
      );

    try {
      const fetchedUnits = await Promise.all(unitPromises);
      setUnitDetails(fetchedUnits);
    } catch (error) {
      console.error("Failed to fetch unit details:", error);
    }
  };

  const CalendarGrid = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const weeks = [];
    let days = [];
    let day = startDate;

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const dayNamesRow = (
      <div className="grid grid-cols-7 mb-1 border-b">
        {dayNames.map((name) => (
          <div
            key={name}
            className="p-2 text-sm font-medium text-gray-400 text-center md:text-xs"
          >
            {name}
          </div>
        ))}
      </div>
    );

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const daySchedules = schedules.filter((schedule: any) =>
          isSameDay(new Date(schedule.date), cloneDay)
        );
        const isToday = isSameDay(day, new Date());
        const isSelected = selectedDate && isSameDay(day, selectedDate);
        const isCurrentMonth = isSameMonth(day, monthStart);

        days.push(
          <div
            key={day.toString()}
            onClick={() => onDateClick(cloneDay, daySchedules)}
            className={`
              min-h-[100px] md:min-h-[80px] p-2 border-r border-b relative
              transition-all duration-200 cursor-pointer
              ${!isCurrentMonth ? "bg-gray-50" : "bg-white hover:bg-orange-50"}
              ${isSelected ? "ring-2 ring-orange-400 z-10" : ""}
              ${isToday ? "bg-orange-50" : ""}
              last:border-r-0
            `}
          >
            <div className="flex justify-between items-start">
              <span
                className={`
                inline-flex w-6 h-6 items-center justify-center rounded-full
                text-sm md:text-xs
                ${
                  isToday
                    ? "bg-orange-500 text-white"
                    : isCurrentMonth
                    ? "text-gray-700"
                    : "text-gray-400"
                }
              `}
              >
                {format(day, "d")}
              </span>
              {daySchedules.length > 0 && (
                <span className="text-xs bg-orange-100 text-orange-800 px-1.5 rounded-full">
                  {daySchedules.length}
                </span>
              )}
            </div>

            <div className="mt-1 space-y-1">
              {daySchedules
                .slice(0, 2)
                .map((schedule: Schedule, index: number) => (
                  <div
                    key={index}
                    className="text-xs md:text-[10px] px-1.5 py-0.5 rounded
                    bg-orange-100 text-orange-800 truncate border-l-2 border-orange-400"
                  >
                    {schedule.title}
                  </div>
                ))}
              {daySchedules.length > 2 && (
                <div className="text-xs md:text-[10px] text-gray-500 pl-1">
                  +{daySchedules.length - 2}
                </div>
              )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      weeks.push(
        <div key={day.toString()} className="grid grid-cols-7">
          {days}
        </div>
      );
      days = [];
    }

    return (
      <div className="bg-white rounded-lg shadow-sm border">
        {dayNamesRow}
        {weeks}
      </div>
    );
  };

  return (
    <div className="w-full flex space-y-0 gap-6 md:space-y-6 flex-col">
      {/* Calendar Side */}
      <div className="flex-1 md:w-full">
        {/* Calendar Header */}
        <div className="flex items-center justify-between px-4 mb-6">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-xl font-semibold text-gray-800">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Calendar Grid */}
        <CalendarGrid />

        {/* Add Schedule Button */}
        <button
          onClick={() => openModal("schedule")}
          className="fixed bottom-20 right-4 w-12 h-12 md:bottom-24 md:right-6
            flex items-center justify-center rounded-full bg-orange-500 
            text-white shadow-lg hover:bg-orange-600 transition-colors z-50"
        >
          <CalendarPlus className="w-6 h-6" />
        </button>
      </div>

      <div className=" w-full flex md:block md:space-y-10 space-x-6 md:space-x-0">
        <ScheduleDisplay
          schedules={selectedSchedules}
          unitDetails={unitDetails}
          title={selectedDate ? format(selectedDate, "PPP") : "Select a date"}
          maxHeight=""
        />
        <ScheduleDisplay
          schedules={upcomingSchedules}
          unitDetails={upcomingUnitDetails}
          title="Upcoming (Next 7 Days)"
          maxHeight=""
          showDate={true}
        />
      </div>
    </div>
  );
};

export default DateCalendar;

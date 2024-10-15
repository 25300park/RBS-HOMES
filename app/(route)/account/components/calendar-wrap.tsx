"use client";
import React, { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { formatDistanceToNow, isAfter, format } from "date-fns";

export interface Schedule {
  id: number;
  date: Date;
  unitId: number;
  message: string;
}

export interface CalendarWrapProps {
  markedDate: any;
  schedules: any;
}

const CalendarWrap = ({ markedDate, schedules }: CalendarWrapProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [upcomingSchedules, setUpcomingSchedules] = useState<Schedule[]>([]);
  const [highlightedSchedules, setHighlightedSchedules] = useState<Schedule[]>(
    []
  );

  // 선택된 날짜에 해당하는 스케줄 필터링
  useEffect(() => {
    if (selectedDate) {
      const filteredSchedules = schedules?.filter(
        (schedule : any) =>
          selectedDate?.toDateString() ===
          new Date(schedule.date).toDateString()
      );
      setHighlightedSchedules(filteredSchedules);
    }
  }, [selectedDate, schedules]);

  // 앞으로 있을 스케줄 필터링
  useEffect(() => {
    const now = new Date();
    const filteredUpcomingSchedules = schedules.filter((schedule : any) => {
      const scheduleDate = new Date(schedule.date);
      return isAfter(scheduleDate, now); // 현재보다 이후의 스케줄만 필터링
    });

    setUpcomingSchedules(filteredUpcomingSchedules);
  }, [schedules]);

  return (
    <div className="flex gap-8">
      {/* 달력 */}
      <div>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          markedDates={markedDate}
          className="rounded-md border shadow w-fit bg-white"
        />
      </div>

      {/* 스케줄 리스트 */}
      <div className="w-full">
        <h2 className="text-lg font-semibold mb-4">Upcoming Schedules</h2>

        {/* 앞으로 있을 스케줄 */}
        {upcomingSchedules.length > 0 ? (
          <div className="mb-6">
            <h3 className="text-md font-semibold">Future Schedules</h3>
            <div className="space-y-4">
              {upcomingSchedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="p-4 border rounded-lg shadow-lg bg-gradient-to-r from-blue-500 via-pink-500 to-orange-500 text-white"
                >
                  <p className="text-lg font-bold">{schedule.message}</p>
                  <p className="text-sm">
                    Scheduled for{" "}
                    <span className="font-semibold">
                      {format(new Date(schedule.date), "PPP")}
                    </span>
                  </p>
                  <p className="text-xs text-gray-200">
                    {formatDistanceToNow(new Date(schedule.date))} from now
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No upcoming schedules found.</p>
        )}

        {/* 선택된 날짜의 스케줄 */}
        <h3 className="text-md font-semibold">Selected Date Schedules</h3>
        {highlightedSchedules.length > 0 ? (
          <div className="space-y-4">
            {highlightedSchedules.map((schedule) => (
              <div
                key={schedule.id}
                className="p-4 border rounded-lg shadow bg-blue-100"
              >
                <p>{schedule.message}</p>
                <p className="text-gray-500 text-sm">
                  Scheduled for {new Date(schedule.date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p>No schedules for the selected date.</p>
        )}
      </div>
    </div>
  );
};

export default CalendarWrap;

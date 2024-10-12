"use client";
import React, { useEffect, useState } from "react";

import { Calendar } from "@/components/ui/calendar";

export interface CalendarWrapProps {
 markedDate: any;
}

const CalendarWrap = ({markedDate}: CalendarWrapProps): React.ReactNode => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  return (
    <div>
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={setSelectedDate}
        markedDates={markedDate}
        className="rounded-md border shadow w-fit bg-white"
      />

      {/* 선택된 날짜 표시 */}
      {selectedDate && (
        <div className="mt-4">
          <p className="text-lg">
            Selected Date:{" "}
            <span className="font-bold">{selectedDate?.toDateString()}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default CalendarWrap;

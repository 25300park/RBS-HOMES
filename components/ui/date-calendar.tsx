"use client";

import React, { useState, useEffect } from "react";
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

interface Schedule {
  id: number;
  date: Date;
  message: string;
  unitId: number;
}

interface UnitDetail {
  unitId: number;
  data: any;
}

interface DateCalendarProps {
  markedDates: any;
  schedules: any;
  fetchUnitDetails: (unitId: number) => Promise<any>; // unit 데이터 호출 함수
}

const DateCalendar: React.FC<DateCalendarProps> = ({
  markedDates,
  schedules,
  fetchUnitDetails,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null); // 선택된 날짜
  const [selectedSchedules, setSelectedSchedules] = useState<Schedule[]>([]); // 선택된 날짜의 스케줄
  const [unitDetails, setUnitDetails] = useState<UnitDetail[]>([]); // 여러 unit 데이터를 관리할 배열
  const [upcomingSchedules, setUpcomingSchedules] = useState<Schedule[]>([]); // 앞으로 일주일 동안의 스케줄
  const [upcomingUnitDetails, setUpcomingUnitDetails] = useState<UnitDetail[]>([]); // 앞으로 일주일 동안의 유닛 상세 정보
  const { openModal } = useModalStore();

  useEffect(() => {
    // 첫 렌더링 시 오늘 날짜의 스케줄을 설정
    const today = new Date();
    onDateClick(today, schedules.filter((schedule: any) =>
      isSameDay(new Date(schedule.date), today)
    ));

    // 앞으로 일주일 동안의 스케줄을 설정
    const nextWeek = addWeeks(today, 1);
    const upcoming = schedules.filter(
      (schedule: Schedule) =>
        schedule.date >= today && schedule.date <= nextWeek
    );

    setUpcomingSchedules(upcoming);

    // unitId가 -1이 아닌 스케줄들에 대해 unit 데이터를 가져오는 프로미스 배열 생성
    const unitPromises = upcoming
      .filter((schedule: any) => schedule.unitId !== -1)
      .map((schedule: any) =>
        fetchUnitDetails(schedule.unitId).then((data) => ({
          unitId: schedule.unitId,
          data,
        }))
      );

    Promise.all(unitPromises)
      .then((fetchedUnits) => {
        setUpcomingUnitDetails(fetchedUnits);
      })
      .catch((error) => {
        console.error("Failed to fetch unit details for upcoming schedules:", error);
      });
  }, [schedules]);

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={prevMonth}
          className="p-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
        >
          Prev
        </button>
        <div className="text-xl font-semibold">
          {format(currentMonth, "MMMM yyyy")}
        </div>
        <button
          onClick={nextMonth}
          className="p-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
        >
          Next
        </button>
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    const dateFormat = "eeee";
    const startDate = startOfWeek(currentMonth);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div className="flex-1 text-center font-medium text-gray-700" key={i}>
          {format(addDays(startDate, i), dateFormat)}
        </div>
      );
    }

    return <div className="flex">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, "d");
        const cloneDay = day;

        // 날짜가 markedDates에 포함되어 있으면 true
        const isMarked = markedDates.some((markedDate: any) =>
          isSameDay(new Date(markedDate), cloneDay)
        );

        // 해당 날짜의 스케줄 필터링
        const daySchedules = schedules.filter((schedule: any) =>
          isSameDay(new Date(schedule.date), cloneDay)
        );

        const isToday = isSameDay(day, new Date());
        const isSelected = isSameDay(day, selectedDate || new Date());

        days.push(
          <div
            className={`relative flex-1 h-28 border rounded-lg cursor-pointer transition-all duration-150 ease-in-out ${
              !isSameMonth(day, monthStart)
                ? "border-gray-100"
                : isSelected
                ? "border-orange-400"
                : isMarked
                ? "hover:border-gray-800"
                : "bg-white text-gray-800 hover:border-gray-800"
            }`}
            key={day.toString()}
            onClick={() => onDateClick(cloneDay, daySchedules)}
          >
            <span className="text-center font-bold p-2">{formattedDate}</span>

            {/* 오늘 날짜에 "Today" 표시 */}
            {isToday && (
              <div className="absolute top-1 right-1 text-xs text-orange-500 px-3 py-1">
                Today
              </div>
            )}

            {/* 스케줄이 있는 날짜의 스타일 개선 */}
            {daySchedules.length > 0 && (
              <div className="mt-1">
                {daySchedules
                  .slice(0, 2)
                  .map((schedule: any, index: number) => (
                    <div
                      key={index}
                      className="text-xs bg-orange-100 p-1 mt-1 truncate border-l-2 border-orange-600"
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {schedule.message}
                    </div>
                  ))}
                {daySchedules.length > 2 && (
                  <div className="text-xs mt-1 text-center text-gray-500">
                    +{daySchedules.length - 2} more
                  </div>
                )}
              </div>
            )}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="flex justify-between" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }

    return <div className="mt-4">{rows}</div>;
  };

  const onDateClick = async (day: Date, daySchedules: Schedule[]) => {
    setSelectedDate(day);
    setSelectedSchedules(daySchedules);

    // unitId가 -1이 아닌 스케줄들에 대해 unit 데이터를 가져오는 프로미스 배열 생성
    const unitPromises = daySchedules
      .filter((schedule) => schedule.unitId !== -1)
      .map((schedule) =>
        fetchUnitDetails(schedule.unitId).then((data) => ({
          unitId: schedule.unitId,
          data,
        }))
      );

    try {
      // 모든 unit 데이터를 가져와 상태에 저장
      const fetchedUnits = await Promise.all(unitPromises);
      setUnitDetails(fetchedUnits);
    } catch (error) {
      console.error("Failed to fetch unit details:", error);
    }
  };

  return (
    <div className="w-full mx-auto p-4">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
      {/* 선택된 날짜의 스케줄 및 유닛 상세 정보 표시 */}
      <div className="mt-6">
        <div
          onClick={() => openModal("schedule")}
          className="fixed bottom-10 right-10 rounded-full bg-orange-200 text-orange-800 flex items-center justify-center shadow-lg font-bold text-xl cursor-pointer"
        >
          스케줄 추가
        </div>
        {/* <ScheduleModal units={[]} date={selectedDate} /> */}
        <h3 className="text-lg font-semibold">
          {selectedDate
            ? `Selected Date: ${format(selectedDate, "PPP")}`
            : "No date selected"}
        </h3>
        {selectedSchedules.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {selectedSchedules.map((schedule) => {
              const unitDetail = unitDetails.find(
                (unit) => unit.unitId === schedule.unitId
              );
              return (
                <li key={schedule.id} className="">
                  <p className=" text-orange-800">{schedule.message}</p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(schedule.date), "PPP, p")}
                  </p>
                  {/* 유닛 디테일이 존재할 경우 표시 */}
                  {unitDetail && (
                    <div className="mt-2 p-2 bg-blue-100 border border-blue-200 rounded-lg">
                      <img
                        src={JSON.parse(unitDetail.data.images)[0]}
                        alt="unit image"
                        className="w-20 h-20 object-cover"
                      />
                      <p className=" text-blue-700">{unitDetail.data.title}</p>
                      <p className=" text-blue-700">
                        {unitDetail.data.fullAdress}
                      </p>
                      <p className="text-sm text-gray-600">
                        Price: {unitDetail.data.price}
                      </p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-gray-600 mt-4">No schedules for this date.</p>
        )}
      </div>

      {/* 앞으로 일주일 동안의 스케줄 목록 */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold">Upcoming Schedules (Next 7 Days)</h3>
        {upcomingSchedules.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {upcomingSchedules.map((schedule) => {
              const unitDetail = upcomingUnitDetails.find(
                (unit) => unit.unitId === schedule.unitId
              );
              return (
                <li key={schedule.id} className="">
                  <p className=" text-orange-800">{schedule.message}</p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(schedule.date), "PPP, p")}
                  </p>
                  {/* 유닛 디테일이 존재할 경우 표시 */}
                  {unitDetail && (
                    <div className="mt-2 p-2 bg-blue-100 border border-blue-200 rounded-lg">
                      <img
                        src={JSON.parse(unitDetail.data.images)[0]}
                        alt="unit image"
                        className="w-20 h-20 object-cover"
                      />
                      <p className=" text-blue-700">{unitDetail.data.title}</p>
                      <p className=" text-blue-700">
                        {unitDetail.data.fullAdress}
                      </p>
                      <p className="text-sm text-gray-600">
                        Price: {unitDetail.data.price}
                      </p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-gray-600 mt-4">No upcoming schedules.</p>
        )}
      </div>
    </div>
  );
};

export default DateCalendar;

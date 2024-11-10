"use client";

import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { getUnitSceduleList, addSchedule } from "@/app/(route)/account/action";
import { Textarea } from "../ui/textarea";
import { enUS } from "date-fns/locale";
import {
  format,
  setHours,
  setMinutes,
  startOfDay,
  endOfDay,
  addHours,
} from "date-fns";
import { IoClose } from "react-icons/io5";

interface Unit {
  id: number;
  title: string;
  price: number;
  fullAddress: string[];
  images: string;
}

interface ScheduleModalProps {
  onClose: () => void;
  modalProps?: string;
}

export default function ScheduleModal({
  modalProps,
  onClose,
}: ScheduleModalProps) {
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [title, setTitle] = useState<string>("");
  const [desc, setDesc] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [eventType, setEventType] = useState<"task" | "unit">("task");
  const [units, setUnits] = useState<any>([]);
  const [isAllDay, setIsAllDay] = useState(true);
  const [isUnitSelectOpen, setIsUnitSelectOpen] = useState(false);

  // 시간 상태를 Date 객체로 관리
  const [startTime, setStartTime] = useState<Date>(() => {
    const date = new Date();
    return setMinutes(setHours(date, 9), 0);
  });

  const [endTime, setEndTime] = useState<Date>(() => {
    const date = new Date();
    return setMinutes(setHours(date, 10), 0);
  });

  useEffect(() => {
    const fetchUnitScheduleList = async () => {
      try {
        const data = await getUnitSceduleList();
        setUnits(data);
      } catch (error) {
        console.error("Error fetching unit schedules:", error);
      }
    };

    fetchUnitScheduleList();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate) {
      toast({
        title: "Error",
        description: "Please select a date",
        variant: "destructive",
      });
      return;
    }

    // 날짜와 시간 결합
    const startDateTime = new Date(selectedDate);
    const endDateTime = new Date(selectedDate);

    if (!isAllDay) {
      startDateTime.setHours(startTime.getHours(), startTime.getMinutes(), 0);
      endDateTime.setHours(endTime.getHours(), endTime.getMinutes(), 0);
    } else {
      // 종일 일정의 경우 시작은 0시 0분, 종료는 23시 59분으로 설정
      const start = startOfDay(startDateTime);
      const end = endOfDay(endDateTime);
      startDateTime.setHours(
        start.getHours(),
        start.getMinutes(),
        start.getSeconds()
      );
      endDateTime.setHours(end.getHours(), end.getMinutes(), end.getSeconds());
    }

    const scheduleData = {
      unitId: eventType === "unit" && selectedUnit ? selectedUnit.id : -1,
      title,
      desc: desc,
      date: selectedDate,
      startedAt: startDateTime,
      endedAt: endDateTime,
      status: 0,
    };

    try {
      const response = await addSchedule(scheduleData);
      if (response.status === 200) {
        onClose();
      }
      toast({
        title: response.status === 200 ? "Success" : "Failed",
        description: response.message,
        variant: response.status === 200 ? "default" : "destructive",
      });
    } catch (error) {
      console.error("Error saving schedule:", error);
      toast({
        title: "Error",
        description: "Failed to add schedule",
        variant: "destructive",
      });
    }
  };

  return (
    <form className="grid gap-4 pt-8 md:px-4" onSubmit={handleSave}>
      {/* 이벤트 타입 선택 버튼 */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          className={`${
            eventType === "task"
              ? "bg-orange-100 text-orange-400 hover:bg-orange-100"
              : "bg-white text-zinc-500 border-none"
          } shadow-none w-full`}
          variant={eventType === "task" ? "default" : "outline"}
          onClick={() => setEventType("task")}
        >
          Default Task
        </Button>
        <Button
          type="button"
          className={`${
            eventType === "unit"
              ? "bg-orange-100 text-orange-400 hover:bg-orange-100"
              : "bg-white text-zinc-500 border-none"
          } shadow-none w-full`}
          variant={eventType === "unit" ? "default" : "outline"}
          onClick={() => setEventType("unit")}
        >
          Unit-Related Event
        </Button>
      </div>

      {/* 제목과 설명 입력 */}
      <div className="grid gap-2">
        <Input
          type="text"
          id="title"
          placeholder="Enter schedule title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="grid gap-2">
        <Textarea
          id="content"
          placeholder="Enter schedule description"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
      </div>

      {/* 날짜 및 시간 선택 */}
      <div className="space-y-4">
        <div className="grid">
          <DatePicker
            selected={selectedDate}
            onChange={(date: Date | null) => setSelectedDate(date)}
            className="w-full p-2 focus:outline-0 focus:outline-orange-200 focus:ring-orange-400 text-sm border rounded shadow"
            placeholderText="Select a date"
            locale={enUS}
            dateFormat="MMMM d, yyyy"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="allDay"
            checked={isAllDay}
            onCheckedChange={(checked: boolean) => setIsAllDay(checked)}
          />
          <label
            htmlFor="allDay"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            All Day
          </label>
        </div>

        {!isAllDay && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Start:</label>
              <DatePicker
                selected={startTime}
                onChange={(date: Date | null) => {
                  if (date) {
                    setStartTime(date);
                    // 종료 시간이 시작 시간보다 이르면 종료 시간을 시작 시간 + 1시간으로 설정
                    if (endTime < date) {
                      setEndTime(addHours(date, 1));
                    }
                  }
                }}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeCaption="Time"
                dateFormat="h:mm aa"
                locale={enUS}
                minTime={setHours(setMinutes(new Date(), 0), 0)} // 00:00
                maxTime={setHours(setMinutes(new Date(), 45), 23)} // 23:45
                className="w-32 p-2 border rounded focus:ring-2 focus:ring-orange-400 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">End:</label>
              <DatePicker
                selected={endTime}
                onChange={(date: Date | null) => {
                  if (date) {
                    setEndTime(date);
                  }
                }}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeCaption="Time"
                dateFormat="h:mm aa"
                locale={enUS}
                minTime={startTime} // 시작 시간 이후
                maxTime={setHours(setMinutes(new Date(), 45), 23)} // 23:45
                className="w-32 p-2 border rounded focus:ring-2 focus:ring-orange-400 focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* 유닛 선택 */}
      {eventType === "unit" && (
        <div>
          {units?.data?.length > 0 ? (
            <div className="relative">
              {/* 유닛 선택 트리거 버튼 */}
              <button
                type="button"
                onClick={() => setIsUnitSelectOpen(true)}
                className="w-full h-28 p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 hover:bg-gray-50 transition-colors text-left"
              >
                {selectedUnit ? (
                  <div className="flex items-center space-x-4">
                    <img
                      src={selectedUnit.images[0]}
                      alt="Selected unit"
                      className="w-20 h-20 object-cover rounded-md"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {selectedUnit.title}
                      </div>
                      <div className="text-orange-500 text-sm">
                        ₱ {selectedUnit.price.toLocaleString()}
                      </div>
                      <div className="text-gray-500 text-sm truncate">
                        {selectedUnit.fullAddress}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Select a unit
                  </div>
                )}
              </button>

              {/* 유닛 선택 모달 */}
              {isUnitSelectOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center">
                  <div className="bg-white w-full md:h-[85vh] h-[600px] md:w-full max-w-[500px] md:mt-auto md:mb-auto md:rounded-lg overflow-hidden  duration-300">
                    {/* 모달 헤더 */}
                    <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10">
                      <h3 className="text-lg font-medium">Select Unit</h3>
                      <button
                        type="button"
                        onClick={() => setIsUnitSelectOpen(false)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <IoClose className="w-5 h-5" />
                      </button>
                    </div>

                    {/* 유닛 리스트 */}
                    <div
                      className="overflow-y-auto"
                      style={{
                        height: "calc(100% - 60px)",
                        WebkitOverflowScrolling: "touch",
                      }}
                    >
                      {units.data.map((unit: any) => (
                        <button
                          key={unit.id}
                          type="button"
                          className={`w-full p-4 flex items-center space-x-4 hover:bg-gray-50 active:bg-gray-100 transition-colors ${
                            selectedUnit?.id === unit.id ? "bg-orange-50" : ""
                          }`}
                          onClick={() => {
                            setSelectedUnit(unit);
                            setIsUnitSelectOpen(false);
                          }}
                        >
                          <img
                            src={unit.images[0]}
                            alt={unit.title}
                            className="w-20 h-20 object-cover rounded-md flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0 text-left">
                            <div className="font-medium truncate">
                              {unit.title}
                            </div>
                            <div className="text-orange-500 text-sm">
                              ₱ {unit.price.toLocaleString()}
                            </div>
                            <div className="text-gray-500 text-sm truncate">
                              {unit.fullAddress}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p>No units available</p>
          )}
        </div>
      )}

      <div className="w-full flex justify-end">
        <Button
          type="submit"
          className="bg-orange-300 text-white hover:bg-orange-400 w-32 md:w-full"
        >
          Save
        </Button>
      </div>
    </form>
  );
}

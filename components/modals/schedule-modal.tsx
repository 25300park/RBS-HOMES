"use client";

import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getUnitSceduleList, addSchedule } from "@/app/(route)/account/action";
import { Textarea } from "../ui/textarea";

interface Unit {
  id: number;
  title: string;
  price: number;
  fullAddress: string;
  image: string;
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
  
  // 새로 추가되는 state
  const [isAllDay, setIsAllDay] = useState(true);
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("10:00");

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
      const [startHours, startMinutes] = startTime.split(":").map(Number);
      const [endHours, endMinutes] = endTime.split(":").map(Number);
      
      startDateTime.setHours(startHours, startMinutes);
      endDateTime.setHours(endHours, endMinutes);
    } else {
      // 종일 일정의 경우 시작은 0시 0분, 종료는 23시 59분으로 설정
      startDateTime.setHours(0, 0, 0);
      endDateTime.setHours(23, 59, 59);
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
      toast({
        title: response.status === 200 ? "Success" : "Failed",
        description: response.message,
        variant: response.status === 200 ? "default" : "destructive",
      });
      onClose();
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
    <form className="grid gap-4 pt-8" onSubmit={handleSave}>
      <div className="flex items-center gap-2">
        <Button
          className={`${
            eventType === "task"
              ? "bg-orange-100 text-orange-400 hover:bg-orange-100"
              : "bg-white text-zinc-500 border-none"
          } shadow-none w-full`}
          variant={eventType === "task" ? "default" : "outline"}
          onClick={(e) => {
            e.preventDefault();
            setEventType("task");
          }}
        >
          Default Task
        </Button>
        <Button
          className={`${
            eventType === "unit"
              ? "bg-orange-100 text-orange-400 hover:bg-orange-100"
              : "bg-white text-zinc-500 border-none"
          } shadow-none w-full`}
          variant={eventType === "unit" ? "default" : "outline"}
          onClick={(e) => {
            e.preventDefault();
            setEventType("unit");
          }}
        >
          Unit-Related Event
        </Button>
      </div>

      {/* Title input */}
      <div className="grid gap-2">
        <Input
          type="text"
          id="title"
          placeholder="Enter schedule title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* Description input */}
      <div className="grid gap-2">
        <Textarea
          id="content"
          placeholder="Enter schedule description"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
      </div>

      {/* Date and Time Selection */}
      <div className="space-y-4">
        <div className="grid">
          <DatePicker
            selected={selectedDate}
            onChange={(date: Date | null) => setSelectedDate(date)}
            className="w-full p-2 focus:outline-0 focus:outline-orange-200 focus:ring-orange-400 text-sm border rounded shadow"
            placeholderText="Select a date"
          />
        </div>

        {/* All Day Toggle */}
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

        {/* Time Selection - only shown if not all day */}
        {!isAllDay && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Start:</label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-32"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">End:</label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-32"
              />
            </div>
          </div>
        )}
      </div>

      {/* Unit Selection */}
      {eventType === "unit" && (
        <div className="">
          {units?.data?.length > 0 ? (
            <Select
              onValueChange={(value) =>
                setSelectedUnit(
                  units.data.find((u: any) => u.id.toString() === value)
                )
              }
            >
              <SelectTrigger className="h-28 w-full max-w-[460px]">
                <SelectValue placeholder="Select a unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup className="overflow-y-auto max-h-[30rem] max-w-full">
                  {units?.data?.map((unit: any) => (
                    <SelectItem
                      key={unit.id}
                      value={unit.id.toString()}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center space-x-4">
                        <img
                          src={unit.images[0]}
                          alt="unit image"
                          className="w-20 h-20 object-cover"
                        />
                        <div className="flex-1">
                          <div className="text-left">
                            {unit.title} <br /> ₱ {unit.price.toLocaleString()}{" "}
                            <br /> {unit.fullAddress}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          ) : (
            <p>No units available</p>
          )}
        </div>
      )}

      <div className="w-full flex justify-end">
        <Button
          type="submit"
          className="bg-orange-300 text-white hover:bg-orange-400 w-32"
        >
          Save
        </Button>
      </div>
    </form>
  );
}
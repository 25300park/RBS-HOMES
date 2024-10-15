"use client";

import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "@/hooks/use-toast"; // shadcn toast 사용
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getUnitSceduleList , addSchedule} from "@/app/(route)/account/action"; 

// Unit data type definition
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

export default function ScheduleModal({ modalProps,onClose }: ScheduleModalProps) {
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null); // Selected unit
  const [title, setTitle] = useState<string>(""); // Title
  const [selectedDate, setSelectedDate] = useState<Date | null>(null); // Date
  const [eventType, setEventType] = useState<"task" | "unit">("task"); // Event type
  const [units, setUnits] = useState<any>([]);

  // 유닛 데이터 가져오기
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

    const unitId = eventType === "unit" && selectedUnit ? selectedUnit.id : -1;
    console.log(selectedDate)
    try {
      const response = await addSchedule(title, selectedDate!, unitId);
      toast({
        title: response.status === 200 ? "Success" : "Failed",
        description: response.message, 
        variant: response.status === 200 ? "default" : "destructive",
      });
      onClose()
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
      {/* Title input */}
      <div className="grid gap-2">
        <Input
          type="text"
          id="title"
          placeholder="Enter schedule title"
          value={title}
          onChange={(e) => setTitle(e.target.value)} // Title 업데이트
        />
      </div>

      <div className="flex items-center gap-2">
        <Button
          className={`${
            eventType === "task"
              ? "bg-orange-100 text-orange-400 hover:bg-orange-100"
              : "bg-white text-zinc-500 border-none"
          } shadow-none w-fit`}
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
          } shadow-none w-fit`}
          variant={eventType === "unit" ? "default" : "outline"}
          onClick={(e) => {
            e.preventDefault();
            setEventType("unit");
          }}
        >
          Unit-Related Event
        </Button>
      </div>

      {/* Date picker */}
      <div className="grid">
        <DatePicker
          selected={selectedDate}
          onChange={(date: Date | null) => setSelectedDate(date)}
          className="w-full p-2 focus:outline-0 focus:outline-orange-200 focus:ring-orange-400 text-sm border rounded shadow"
          placeholderText="Select a date"
        />
      </div>

      {/* Unit Selection - only visible if eventType is "unit" */}
      {eventType === "unit" && (
        <div className="">
          {units?.data?.length > 0 ? (
            <Select onValueChange={(value) => setSelectedUnit(units.data.find((u: any) => u.id.toString() === value))}>
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
        {/* Save button */}
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

// {
//   /* <div className="ml-4">
//           <Input
//             type="time"
//             id="start-time"
//             value={timeRange.start}
//             className="border-none shadow-none focus:bg-gray-100 focus:outline-none focus-visible:ring-0 focus:border-none"
//             onChange={(e) =>
//               setTimeRange({ ...timeRange, start: e.target.value })
//             }
//           />
//         </div>
//         ~
//         <div>
//           <Input
//             type="time"
//             id="end-time"
//             value={timeRange.end}
//             className="border-none shadow-none focus:bg-gray-100 focus:outline-none focus-visible:ring-0 focus:border-none"
//             onChange={(e) =>
//               setTimeRange({ ...timeRange, end: e.target.value })
//             }
//           />
//         </div> */
// }
// {
//   /* Location input */
// }
// {
//   /* {eventType === "task" && (
//         <div className="grid gap-2">
//           <Input
//             type="text"
//             id="location"
//             placeholder="Add location"
//             value={location}
//             onChange={(e) => setLocation(e.target.value)}
//           />
//         </div>
//       )} */
// }

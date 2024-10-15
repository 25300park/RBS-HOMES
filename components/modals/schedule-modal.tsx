import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

// Schedule form component
export default function ScheduleModal({
  onClose,
  modalProps,
}: ScheduleModalProps) {
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null); // Selected unit
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [timeRange, setTimeRange] = useState({ start: "", end: "" }); // Time range
  const [location, setLocation] = useState(""); // Location field
  const [eventType, setEventType] = useState<"task" | "unit">("task"); // Event type: Default task or unit-related event
  const [isAllDay, setIsAllDay] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const handleScheduleType = (type: string) => {
    if (type === "task") {
      setEventType(type);
    } else {
    }
  };
  return (
    <form className="grid gap-4 pt-8">
      {/* Title input */}
      <div className="grid gap-2">
        <Input type="text" id="title" placeholder="Enter schedule title" />
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

      {/* Time range picker */}
      <div className="grid">
        {/* Date picker */}
        <DatePicker
          selected={selectedDate}
          onChange={(date: Date | null) => setSelectedDate(date)}
          className="w-full p-2 focus:outline-0 focus:outline-orange-200 focus:ring-orange-400 text-sm border rounded shadow"
          placeholderText="Select a date"
        />
        {/* <div className="ml-4">
          <Input
            type="time"
            id="start-time"
            value={timeRange.start}
            className="border-none shadow-none focus:bg-gray-100 focus:outline-none focus-visible:ring-0 focus:border-none"
            onChange={(e) =>
              setTimeRange({ ...timeRange, start: e.target.value })
            }
          />
        </div>
        ~
        <div>
          <Input
            type="time"
            id="end-time"
            value={timeRange.end}
            className="border-none shadow-none focus:bg-gray-100 focus:outline-none focus-visible:ring-0 focus:border-none"
            onChange={(e) =>
              setTimeRange({ ...timeRange, end: e.target.value })
            }
          />
        </div> */}
      </div>

      {/* Location input */}
      <div className="grid gap-2">
        <Input
          type="text"
          id="location"
          placeholder="Add location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      {/* Unit Selection - only visible if eventType is "unit" */}
      {/* {eventType === "unit" && (
        <div className="grid gap-2">
          {units.length > 0 ? (
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select a unit" />
              </SelectTrigger>
              <SelectContent>
                {units.map((unit: any) => (
                  <SelectItem key={unit.id} value={unit.id.toString()}>
                    {unit.title} - {unit.price} - {unit.fullAddress}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p>No units available</p>
          )}
        </div>
      )} */}
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

"use client";

import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  getUnitShceduleList,
  addSchedule,
  updateSchedule,
  getUnitDetails,
} from "@/app/(route)/account/action";
import { Textarea } from "@/components/ui/textarea";
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
import { useRouter } from "next/navigation";
import Spinner from "../ui/spinner";

interface Unit {
  id: number;
  title: string;
  price: number;
  fullAddress: string[];
  images: string[];
}

interface ScheduleModalProps {
  onClose: () => void;
  modalProps?: {
    mode?: "create" | "edit";
    scheduleData?: {
      id: number;
      title: string;
      desc?: string;
      date: Date;
      startedAt?: Date;
      endedAt?: Date;
      unitId?: number;
    };
  };
}

export default function ScheduleModal({
  modalProps,
  onClose,
}: ScheduleModalProps) {
  const router = useRouter();
  const isEditMode = modalProps?.mode === "edit";
  const existingData = modalProps?.scheduleData;

  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  const [title, setTitle] = useState<string>(existingData?.title || "");
  const [desc, setDesc] = useState<string>(existingData?.desc || "");
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    existingData?.date ? new Date(existingData.date) : null
  );
  const [eventType, setEventType] = useState<"task" | "unit">(
    existingData?.unitId && existingData.unitId !== -1 ? "unit" : "task"
  );
  const [units, setUnits] = useState<any>([]);
  const [isAllDay, setIsAllDay] = useState(true);
  const [isUnitSelectOpen, setIsUnitSelectOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ?쒓컙 ?곹깭瑜?Date 媛앹껜濡?愿由?
  const [startTime, setStartTime] = useState<Date>(() => {
    if (existingData?.startedAt) {
      return new Date(existingData.startedAt);
    }
    const date = new Date();
    return setMinutes(setHours(date, 9), 0);
  });

  const [endTime, setEndTime] = useState<Date>(() => {
    if (existingData?.endedAt) {
      return new Date(existingData.endedAt);
    }
    const date = new Date();
    return setMinutes(setHours(date, 10), 0);
  });

  // 珥덇린 ?곗씠??濡쒕뱶
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // ?좊떅 紐⑸줉 濡쒕뱶
        const unitsData = await getUnitShceduleList();
        setUnits(unitsData);

        // ?섏젙 紐⑤뱶?먯꽌 ?좊떅 ?곗씠??濡쒕뱶
        if (isEditMode && existingData?.unitId && existingData.unitId !== -1) {
          const unitData = await getUnitDetails(existingData.unitId);
          setSelectedUnit(unitData);

          // ?쒓컙 ?ㅼ젙
          if (existingData.startedAt && existingData.endedAt) {
            setIsAllDay(false);
            const start = new Date(existingData.startedAt);
            const end = new Date(existingData.endedAt);
            setStartTime(start);
            setEndTime(end);
          }
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
        toast({
          title: "Error",
          description: "Failed to load data",
          variant: "destructive",
        });
      }
    };

    loadInitialData();
  }, [isEditMode, existingData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!selectedDate) {
        toast({
          title: "Error",
          description: "Please select a date",
          variant: "destructive",
        });
        return;
      }

      // ?좎쭨? ?쒓컙 寃고빀
      const startDateTime = new Date(selectedDate);
      const endDateTime = new Date(selectedDate);

      if (!isAllDay) {
        startDateTime.setHours(startTime.getHours(), startTime.getMinutes(), 0);
        endDateTime.setHours(endTime.getHours(), endTime.getMinutes(), 0);
      } else {
        // 醫낆씪 ?쇱젙??寃쎌슦 ?쒖옉? 0??0遺? 醫낅즺??23??59遺꾩쑝濡??ㅼ젙
        const start = startOfDay(startDateTime);
        const end = endOfDay(endDateTime);
        startDateTime.setHours(
          start.getHours(),
          start.getMinutes(),
          start.getSeconds()
        );
        endDateTime.setHours(
          end.getHours(),
          end.getMinutes(),
          end.getSeconds()
        );
      }

      const scheduleData = {
        id: existingData?.id,
        unitId: eventType === "unit" && selectedUnit ? selectedUnit.id : -1,
        title,
        desc,
        date: selectedDate,
        startedAt: startDateTime,
        endedAt: endDateTime,
        status: 0,
      };

      let response;
      if (isEditMode) {
        response = await updateSchedule(existingData!.id, scheduleData);
      } else {
        response = await addSchedule(scheduleData);
      }

      if (response.status === 200) {
        toast({
          title: "Success",
          description: response.message,
        });
        router.refresh();
        onClose();
      } else {
        toast({
          title: "Failed",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving schedule:", error);
      toast({
        title: "Error",
        description: "Failed to save schedule",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="grid gap-4 pt-8 md:px-4" onSubmit={handleSave}>
      {/* ?대깽??????좏깮 踰꾪듉 */}
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

      {/* ?쒕ぉ怨??ㅻ챸 ?낅젰 */}
      <div className="grid gap-2">
        <Input
          type="text"
          id="title"
          placeholder="Enter schedule title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
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

      {/* ?좎쭨 諛??쒓컙 ?좏깮 */}
      <div className="space-y-4">
        <div className="grid">
          <DatePicker
            selected={selectedDate}
            onChange={(date: Date | null) => setSelectedDate(date)}
            className="w-full p-2 focus:outline-0 focus:outline-orange-200 focus:ring-orange-400 text-sm border rounded shadow"
            placeholderText="Select a date"
            locale={enUS}
            dateFormat="MMMM d, yyyy"
            required
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
                minTime={setHours(setMinutes(new Date(), 0), 0)}
                maxTime={setHours(setMinutes(new Date(), 45), 23)}
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
                minTime={startTime}
                maxTime={setHours(setMinutes(new Date(), 45), 23)}
                className="w-32 p-2 border rounded focus:ring-2 focus:ring-orange-400 focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* ?좊떅 ?좏깮 */}
      {eventType === "unit" && (
        <div>
          {units?.data?.length > 0 ? (
            <div className="relative">
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
                        ??{selectedUnit.price.toLocaleString()}
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

              {/* ?좊떅 ?좏깮 紐⑤떖 */}
              {isUnitSelectOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center">
                  <div className="bg-white w-full md:h-[85vh] h-[600px] md:w-full max-w-[500px] md:mt-auto md:mb-auto md:rounded-lg overflow-hidden duration-300">
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
                              ??{unit.price.toLocaleString()}
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
            <p className="text-gray-500 p-4">No units available</p>
          )}
        </div>
      )}

      {/* Submit Buttons */}
      <div className="w-full flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="w-32 md:w-full"
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-orange-300 text-white hover:bg-orange-400 w-32 md:w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Spinner className="h-4 w-4" />
              <span>{isEditMode ? "Updating..." : "Saving..."}</span>
            </div>
          ) : (
            <span>{isEditMode ? "Update" : "Save"}</span>
          )}
        </Button>
      </div>

      {/* Unit Selection Required Warning */}
      {eventType === "unit" && !selectedUnit && (
        <p className="text-sm text-orange-600 mt-2">
          Please select a unit for unit-related events
        </p>
      )}
    </form>
  );
}

interface CreateScheduleData {
  title: string;
  desc?: string;
  date: Date;
  startedAt?: Date;
  endedAt?: Date;
  unitId: number;
  status: number;
}

interface UpdateScheduleData extends CreateScheduleData {
  id: number;
}

interface ScheduleResponse {
  status: number;
  message: string;
  data?: any;
}

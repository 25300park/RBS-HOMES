import DateCalendar from "@/components/ui/date-calendar";
import { getUserSchedules, getUnitDetails } from "../../action";

export interface ScheduleHomeProps {}

const ScheduleHome = async  ({}: ScheduleHomeProps) => {
  const { schedules, datesArray } = await getUserSchedules();
  return (
    <div className="px-4">
     <DateCalendar markedDates={datesArray} schedules={schedules} fetchUnitDetails={getUnitDetails}/>
    </div>
  );
};

export default ScheduleHome;

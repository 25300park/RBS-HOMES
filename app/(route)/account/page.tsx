import DateCalendar from "@/components/ui/date-calendar";
import { getUserSchedules, getUnitDetails } from "./action";
import CalendarWrap from "./components/calendar-wrap";

interface AccountHomeProps {}

const AccountHome = async ({}: AccountHomeProps) => {
  const { schedules, datesArray } = await getUserSchedules();
  return (
    <div className="p-6">
      {/* <h2 className="text-xl font-bold mb-4">대시보드</h2> */}
      {/* <CalendarWrap markedDate={datesArray} schedules={schedules} / */}
      <DateCalendar markedDates={datesArray} schedules={schedules} fetchUnitDetails={getUnitDetails}/>
    </div>
  );
};

export default AccountHome;

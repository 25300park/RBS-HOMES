import { getUserSchedules } from "./action";
import CalendarWrap from "./components/calendar-wrap";

interface AccountHomeProps {}

const AccountHome = async ({}: AccountHomeProps) => {
  const { schedules, datesArray } = await getUserSchedules();
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">대시보드</h2>
      <CalendarWrap markedDate={datesArray}/>
      <div>
        <h1>My Schedules</h1>
        {schedules.length === 0 ? (
          <p>No schedules found</p>
        ) : (
          <ul>
            {schedules.map((schedule) => (
              <li key={schedule.id}>
                {schedule?.date?.toDateString()}: {schedule.message}
              </li>
            ))}
          </ul>
        )}
      </div>
      스케줄 추가관련. 스케줄의 타입이 따로 지정이 되야하는지 ex 방문, 미팅 등,  
    </div>
  );
};

export default AccountHome;

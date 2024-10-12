"use client";

import * as React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  markedDates?: Date[]; // 특정 날짜를 표시하기 위해 추가
};

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  markedDates = [], // 프롭으로 받아서 디폴트 값은 빈 배열
  ...props
}: CalendarProps) {
  // 'markedDates'에 포함된 날짜를 커스텀 스타일로 표시
  const modifiers = {
    marked: markedDates,
  };

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4", className)} // 여백을 조정
      modifiers={modifiers} // 특정 날짜에 커스텀 스타일 적용
      modifiersClassNames={{
        marked: "relative marked-dot",
      }}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-lg font-semibold", // 월/연도 표시 크기
        nav: "space-x-2 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-12 w-12 md:h-7 md:w-7 bg-transparent p-0 opacity-70 hover:opacity-100" // 네비게이션 버튼 크기 증가, md일때 기본사이즈
        ),
        nav_button_previous: "absolute left-2",
        nav_button_next: "absolute right-2",
        table: "w-full border-collapse space-y-1", // 날짜 테이블 간격 조정
        head_row: "flex justify-around mb-2", // 요일 줄 간격 조정
        head_cell:
          "text-muted-foreground w-12 md:w-8 font-medium text-[1.2rem] md:text-[0.8rem] text-center", // 요일 셀 간격 및 중앙 정렬, md일때 기본사이즈
        row: "flex justify-around mt-2", // 날짜 셀 간격 조정
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-12 w-12 md:h-8 md:w-8 p-0 font-normal aria-selected:opacity-100" // 날짜 셀 크기 및 간격, md일때 기본사이즈
        ),
        day_range_start: "day-range-start",
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50  aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeftIcon className="h-6 w-6 md:h-4 md:w-4" />, // 화살표 아이콘 크기, md일때 기본사이즈
        IconRight: ({ ...props }) => <ChevronRightIcon className="h-6 w-6 md:h-4 md:w-4" />, // 화살표 아이콘 크기, md일때 기본사이즈
      }}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";

export { Calendar };

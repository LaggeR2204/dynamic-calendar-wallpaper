"use client";
import { useEffect, useState } from "react";

interface CalendarData {
  monthName: string;
  daysInMonth: number;
  startingDayOfWeek: number;
}

interface MonthData {
  monthName: string;
  weeks: (number | null)[][];
  today: number | null;
}

type DayType = number | null;
type WeekType = DayType[];

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setHours(24, 0, 0, 0);
    const msUntilMidnight: number = tomorrow.getTime() - now.getTime();

    const midnightTimer = setTimeout(() => {
      setCurrentDate(new Date());
      const dailyInterval = setInterval(() => {
        setCurrentDate(new Date());
      }, 24 * 60 * 60 * 1000);

      return () => clearInterval(dailyInterval);
    }, msUntilMidnight);

    return () => clearTimeout(midnightTimer);
  }, []);

  const getCalendarData = (year: number, month: number): CalendarData => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth: number = lastDay.getDate();
    const startingDayOfWeek: number = firstDay.getDay();
    const adjustedStartDay: number =
      startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;

    const monthNames: string[] = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    return {
      monthName: monthNames[month],
      daysInMonth,
      startingDayOfWeek: adjustedStartDay,
    };
  };

  const renderMonth = (year: number, month: number): MonthData => {
    const { monthName, daysInMonth, startingDayOfWeek } = getCalendarData(
      year,
      month
    );
    const weeks: WeekType[] = [];
    let week: WeekType = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      week.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      week.push(day);
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    }

    if (week.length > 0) {
      while (week.length < 7) {
        week.push(null);
      }
      weeks.push(week);
    }

    const today: number = currentDate.getDate();
    const currentMonth: number = currentDate.getMonth();
    const currentYear: number = currentDate.getFullYear();
    const isCurrentMonth: boolean =
      month === currentMonth && year === currentYear;

    return {
      monthName,
      weeks,
      today: isCurrentMonth ? today : null,
    };
  };

  const currentYear: number = currentDate.getFullYear();
  const months: number[] = Array.from({ length: 12 }, (_, i) => i);
  const rows: number[][] = [
    months.slice(0, 4),
    months.slice(4, 8),
    months.slice(8, 12),
  ];

  const getDotColor = (day: number, today: number | null): string => {
    if (day === today) return "#ff6b35";
    if (today && day < today) return "#fff";
    return "#555";
  };

  return (
    <div
      className="w-screen h-screen flex items-center justify-center"
      style={{ backgroundColor: "#000" }}
    >
      {/* Top spacer for clock and status bar */}
      <div
        className="absolute top-0 left-0 right-0"
        style={{ height: "280px" }}
      />

      {/* Calendar positioned in top-left */}
      <div>
        <div className="flex flex-col gap-10">
          {rows.map((row: number[], rowIdx: number) => (
            <div key={rowIdx} className="flex gap-10">
              {row.map((monthIdx: number) => {
                const { monthName, weeks, today }: MonthData = renderMonth(
                  currentYear,
                  monthIdx
                );

                return (
                  <div key={monthIdx} className="flex flex-col">
                    <h2
                      className="text-base font-light mb-2"
                      style={{ color: "#999" }}
                    >
                      {monthName}
                    </h2>

                    <div className="flex flex-col gap-1.5">
                      {weeks.map((week: WeekType, weekIdx: number) => (
                        <div key={weekIdx} className="flex gap-1.5">
                          {week.map((day: DayType, dayIdx: number) => (
                            <div
                              key={dayIdx}
                              className="flex items-center justify-center"
                              style={{ width: "16px", height: "16px" }}
                            >
                              {day && (
                                <div
                                  className="rounded-full"
                                  style={{
                                    width: "16px",
                                    height: "16px",
                                    backgroundColor: getDotColor(day, today),
                                  }}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom spacer for profile avatar */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{ height: "120px" }}
      />
    </div>
  );
}

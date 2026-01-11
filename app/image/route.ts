import { ImageResponse } from "next/og";
import React from "react";
import moment, { Moment } from "moment-timezone";

const CALENDAR_WIDTH = 3024;
const CALENDAR_HEIGHT = 1964;
const TZ = "Asia/Ho_Chi_Minh";

type DayType = number | null;
type WeekType = DayType[];

interface CalendarData {
  monthName: string;
  daysInMonth: number;
  startingDayOfWeek: number;
}

interface MonthData {
  monthName: string;
  weeks: WeekType[];
  today: number | null;
}

function getCalendarData(year: number, month: number): CalendarData {
  const firstDay = moment.tz([year, month, 1], TZ);
  const lastDay = firstDay.clone().endOf("month");
  const daysInMonth: number = lastDay.date();
  const startingDayOfWeekRaw: number = firstDay.day(); // 0 (Sun) - 6 (Sat)
  const adjustedStartDay: number = startingDayOfWeekRaw === 0 ? 6 : startingDayOfWeekRaw - 1;

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
}

function renderMonth(now: Moment, year: number, month: number): MonthData {
  const { monthName, daysInMonth, startingDayOfWeek } = getCalendarData(year, month);
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

  const today: number = now.date();
  const currentMonth: number = now.month();
  const currentYear: number = now.year();
  const isCurrentMonth: boolean = month === currentMonth && year === currentYear;

  return {
    monthName,
    weeks,
    today: isCurrentMonth ? today : null,
  };
}

function getDotColor(day: number, today: number | null): string {
  if (day === today) return "#ff6b35";
  if (today && day < today) return "#fff";
  return "#555";
}

export function CalendarImage({ now }: { now: Moment }): React.ReactElement {
  const currentYear: number = now.year();
  const months: number[] = Array.from({ length: 12 }, (_, i) => i);
  const rows: number[][] = [
    months.slice(0, 4),
    months.slice(4, 8),
    months.slice(8, 12),
  ];

  const monthRows = rows.map((row, rowIdx) => {
    const monthCols = row.map((monthIdx) => {
      const { monthName, weeks, today } = renderMonth(now, currentYear, monthIdx);

      const weekElements = weeks.map((week, weekIdx) => {
        const dayElements = week.map((day, dayIdx) => {
          const dayDot =
            day != null
              ? React.createElement("div", {
                  key: `dot-${dayIdx}`,
                  style: {
                    width: 22,
                    height: 22,
                    borderRadius: 9999,
                    backgroundColor: getDotColor(day, today),
                  },
                })
              : null;

          return React.createElement(
            "div",
            {
              key: `day-${dayIdx}`,
              style: {
                width: 22,
                height: 22,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              },
            },
            dayDot
          );
        });

        return React.createElement(
          "div",
          {
            key: `week-${weekIdx}`,
            style: {
              display: "flex",
              gap: 6,
            },
          },
          ...dayElements
        );
      });

      return React.createElement(
        "div",
        {
          key: `month-${monthIdx}`,
          style: {
            display: "flex",
            flexDirection: "column",
          },
        },
        React.createElement(
          "h2",
          {
            style: {
              fontSize: 22,
              fontWeight: 400,
              marginBottom: 8,
              color: "#999",
            },
          },
          monthName
        ),
        React.createElement(
          "div",
          {
            style: {
              display: "flex",
              flexDirection: "column",
              gap: 6,
            },
          },
          ...weekElements
        )
      );
    });

    return React.createElement(
      "div",
      {
        key: `row-${rowIdx}`,
        style: {
          display: "flex",
          gap: 40,
        },
      },
      ...monthCols
    );
  });

  return React.createElement(
    "div",
    {
      style: {
        width: CALENDAR_WIDTH,
        height: CALENDAR_HEIGHT,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#000",
        position: "relative",
        paddingTop: CALENDAR_HEIGHT * 0.25,
        paddingBottom: CALENDAR_HEIGHT * 0.1,
      },
    },
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "column",
          gap: 40,
        },
      },
      ...monthRows
    )
  );
}

export async function GET() {
  // Get current time in Vietnam (ICT - Indochina Time, UTC+7)
  const now = moment().tz(TZ);
  console.log("Generating calendar image for date:", now.format());

  return new ImageResponse(React.createElement(CalendarImage, { now }), {
    width: CALENDAR_WIDTH,
    height: CALENDAR_HEIGHT,
  });
}
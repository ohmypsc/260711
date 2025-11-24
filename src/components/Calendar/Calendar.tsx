import React, { useMemo } from "react";
import "./Calendar.scss";

// ✅ 결혼식 날짜
const WEDDING = {
  year: 2026,
  month: 7, // 1~12
  day: 11,
  hour: 11,
  minute: 0,
};

// 요일 라벨(일~토)
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export const Calendar = () => {
  const {
    year,
    month,
    day: weddingDay,
    hour,
    minute,
  } = WEDDING;

  const calendarGrid = useMemo(() => {
    // monthIndex: JS Date는 0~11
    const monthIndex = month - 1;

    const firstDate = new Date(year, monthIndex, 1);
    const lastDate = new Date(year, monthIndex + 1, 0);

    const firstWeekday = firstDate.getDay(); // 0(일)~6(토)
    const daysInMonth = lastDate.getDate();

    // 앞쪽 빈칸 + 날짜 + 뒤쪽 빈칸 채워서 7칸 단위 배열 만들기
    const cells: Array<{ type: "empty" | "day"; value?: number }> = [];

    // 앞쪽 empty
    for (let i = 0; i < firstWeekday; i++) cells.push({ type: "empty" });

    // 날짜
    for (let d = 1; d <= daysInMonth; d++) cells.push({ type: "day", value: d });

    // 뒤쪽 empty (7로 나누어떨어지게)
    while (cells.length % 7 !== 0) cells.push({ type: "empty" });

    // 7칸씩 잘라서 주(weeks) 배열로
    const weeks: typeof cells[] = [];
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7));
    }
    return weeks;
  }, [year, month]);

  const timeText =
    minute === 0 ? `${hour}시` : `${hour}시 ${minute}분`;

  return (
    <div className="calendar-container">
      <h2 className="section-title">캘린더</h2>

      {/* 상단 날짜/시간 */}
      <div className="calendar-header">
        <div className="calendar-date">
          {year}년 {month}월 {weddingDay}일 토요일
        </div>
        <div className="calendar-time">오전 {timeText}</div>
      </div>

      {/* 달력 */}
      <div className="calendar-box">
        {/* 요일 헤더 */}
        <div className="calendar-weekdays">
          {WEEKDAYS.map((w, i) => (
            <div
              key={w}
              className={
                "weekday" + (i === 0 ? " sun" : "") + (i === 6 ? " sat" : "")
              }
            >
              {w}
            </div>
          ))}
        </div>

        {/* 날짜 그리드 */}
        <div className="calendar-weeks">
          {calendarGrid.map((week, wi) => (
            <div className="calendar-week" key={wi}>
              {week.map((cell, ci) => {
                if (cell.type === "empty") {
                  return <div className="calendar-cell empty" key={ci} />;
                }

                const d = cell.value!;
                const isWeddingDay = d === weddingDay;

                return (
                  <div
                    className={
                      "calendar-cell day" + (isWeddingDay ? " wedding" : "")
                    }
                    key={ci}
                  >
                    {d}
                    {isWeddingDay && (
                      <span className="heart" aria-hidden>
                        ♥
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Calendar;

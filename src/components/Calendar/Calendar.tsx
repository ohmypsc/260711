import React, { useMemo, useEffect, useState } from "react";
import "./Calendar.scss";
import { useContactInfo } from "@/ContactInfoProvider";

// ✅ 결혼식 날짜 (KST 기준)
const WEDDING = {
  year: 2026,
  month: 7, // 1~12
  day: 11,
  hour: 11,
  minute: 0,
};

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

// ✅ "오늘인지"를 KST(Asia/Seoul) 기준으로 판별
function isSameKstDate(a: Date, b: Date) {
  const fmt = (d: Date) =>
    new Intl.DateTimeFormat("ko-KR", {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
  return fmt(a) === fmt(b);
}

export const Calendar = () => {
  const contactInfo = useContactInfo();

  const groomName =
    (contactInfo as any[]).find((c) => c.relation === "신랑")?.name || "신랑";
  const brideName =
    (contactInfo as any[]).find((c) => c.relation === "신부")?.name || "신부";

  const { year, month, day: weddingDay, hour, minute } = WEDDING;

  // ✅ 결혼식 Date 객체 (KST로 해석되도록 +09:00 포함)
  const weddingDate = useMemo(() => {
    const m = pad(month);
    const d = pad(weddingDay);
    const hh = pad(hour);
    const mm = pad(minute);
    return new Date(`${year}-${m}-${d}T${hh}:${mm}:00+09:00`);
  }, [year, month, weddingDay, hour, minute]);

  // =========================
  // ✅ Countdown Logic
  // =========================
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const countdownText = useMemo(() => {
    const diffMs = weddingDate.getTime() - now.getTime();

    // 남았을 때
    if (diffMs > 0) {
      let totalSec = Math.floor(diffMs / 1000);

      const days = Math.floor(totalSec / (24 * 3600));
      totalSec %= 24 * 3600;

      const hours = Math.floor(totalSec / 3600);
      totalSec %= 3600;

      const minutes = Math.floor(totalSec / 60);
      const seconds = totalSec % 60;

      return `${groomName}와 ${brideName}의 결혼식이 ${days}일 ${hours}시간 ${minutes}분 ${seconds}초 남았습니다.`;
    }

    // 당일 (시간이 지났어도 같은 날이면 "오늘")
    if (isSameKstDate(now, weddingDate)) {
      return `${groomName}와 ${brideName}의 결혼식이 오늘입니다.`;
    }

    // 지난 후
    const passedMs = Math.abs(diffMs);
    const passedDays = Math.floor(passedMs / (24 * 3600 * 1000));
    return `${groomName}와 ${brideName}의 결혼식이 ${passedDays}일 지났습니다.`;
  }, [now, weddingDate, groomName, brideName]);

  // =========================
  // ✅ Calendar Grid
  // =========================
  const calendarGrid = useMemo(() => {
    const monthIndex = month - 1; // JS Date 0~11
    const firstDate = new Date(year, monthIndex, 1);
    const lastDate = new Date(year, monthIndex + 1, 0);

    const firstWeekday = firstDate.getDay(); // 0(일)~6(토)
    const daysInMonth = lastDate.getDate();

    const cells: Array<{ type: "empty" | "day"; value?: number }> = [];

    for (let i = 0; i < firstWeekday; i++) cells.push({ type: "empty" });
    for (let d = 1; d <= daysInMonth; d++) cells.push({ type: "day", value: d });
    while (cells.length % 7 !== 0) cells.push({ type: "empty" });

    const weeks: typeof cells[] = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    return weeks;
  }, [year, month]);

  const timeText = minute === 0 ? `${hour}시` : `${hour}시 ${minute}분`;

  return (
    <div className="calendar-container">
      <h2 className="section-title">캘린더</h2>

      {/* ✅ Countdown */}
      <p className="countdown-text">{countdownText}</p>

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
                    {/* 숫자 레이어 */}
                    <span className="day-number">{d}</span>

                    {/* ✅ 11일 하트: 숫자 위에 투명 겹침 + 두근 효과 */}
                    {isWeddingDay && (
                      <span className="heart pulse" aria-hidden>
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

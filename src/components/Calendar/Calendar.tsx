import React, { useMemo, useEffect, useState } from "react";
import "./Calendar.scss";
import { useContactInfo } from "@/ContactInfoProvider";

// ✅ 결혼식 날짜 (KST 기준)
const WEDDING = {
  year: 2026,
  month: 7,
  day: 11,
  hour: 11,
  minute: 0,
};

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

// ✅ KST 기준 "오늘" 판별
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

  const countdown = useMemo(() => {
    const diffMs = weddingDate.getTime() - now.getTime();

    // 미래
    if (diffMs > 0) {
      let totalSec = Math.floor(diffMs / 1000);

      const days = Math.floor(totalSec / (24 * 3600));
      totalSec %= 24 * 3600;

      const hours = Math.floor(totalSec / 3600);
      totalSec %= 3600;

      const minutes = Math.floor(totalSec / 60);
      const seconds = totalSec % 60;

      return { mode: "future" as const, days, hours, minutes, seconds };
    }

    // 오늘
    if (isSameKstDate(now, weddingDate)) {
      return { mode: "today" as const };
    }

    // 과거
    const passedDays = Math.floor(Math.abs(diffMs) / (24 * 3600 * 1000));
    return { mode: "past" as const, passedDays };
  }, [now, weddingDate]);

  // =========================
  // ✅ Calendar Grid
  // =========================
  const calendarGrid = useMemo(() => {
    const monthIndex = month - 1;
    const firstDate = new Date(year, monthIndex, 1);
    const lastDate = new Date(year, monthIndex + 1, 0);

    const firstWeekday = firstDate.getDay();
    const daysInMonth = lastDate.getDate();

    const cells: Array<{ type: "empty" | "day"; value?: number }> = [];
    for (let i = 0; i < firstWeekday; i++) cells.push({ type: "empty" });
    for (let d = 1; d <= daysInMonth; d++) cells.push({ type: "day", value: d });
    while (cells.length % 7 !== 0) cells.push({ type: "empty" });

    const weeks: typeof cells[] = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    return weeks;
  }, [year, month]);

  const rows = calendarGrid.length;

  const timeText = minute === 0 ? `${hour}시` : `${hour}시 ${minute}분`;

  return (
    <div className="calendar-container">
      <h2 className="section-title">캘린더</h2>

      {/* ✅ 1) 날짜/요일/시간 한 줄 크게 */}
      <div className="calendar-topline">
        {year}년 {month}월 {weddingDay}일 토요일 오전 {timeText}
      </div>

      {/* 달력 */}
      <div
        className="calendar-box"
        style={{ ["--rows" as any]: rows }}
      >
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
                    <span className="day-number">{d}</span>

                    {/* ✅ 3) 11일 하트 겹치기 + 느릿한 펄스 */}
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

      {/* ✅ 4) 카운트다운 3줄 */}
      <div className="countdown-wrap">
        <div className="countdown-line1">
          {groomName}와 {brideName}의 결혼식이
        </div>

        <div className="countdown-line2">
          {countdown.mode === "future" && (
            <div className="countdown-values" aria-label="카운트다운">
              <div className="unit-block">
                <span className="num">{countdown.days}</span>
                <span className="unit">일</span>
              </div>
              <div className="unit-block">
                <span className="num">{countdown.hours}</span>
                <span className="unit">시간</span>
              </div>
              <div className="unit-block">
                <span className="num">{countdown.minutes}</span>
                <span className="unit">분</span>
              </div>
              <div className="unit-block">
                <span className="num">{countdown.seconds}</span>
                <span className="unit">초</span>
              </div>
            </div>
          )}

          {countdown.mode === "today" && (
            <div className="countdown-status">오늘입니다.</div>
          )}

          {countdown.mode === "past" && (
            <div className="countdown-status">
              {countdown.passedDays}일 지났습니다.
            </div>
          )}
        </div>

        <div className="countdown-line3">
          {countdown.mode === "future" ? "남았습니다." : "\u00A0"}
        </div>
      </div>
    </div>
  );
};

export default Calendar;

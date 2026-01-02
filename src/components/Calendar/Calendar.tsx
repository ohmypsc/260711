import React, { useMemo, useEffect, useState } from "react";
import "./Calendar.scss";

/* =========================================================
   WEDDING CONST
   ========================================================= */
const WEDDING = {
  year: 2026,
  month: 7,
  day: 11,
  hour: 11,
  minute: 0,
};

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/* =========================================================
   UTILS
   ========================================================= */
function pad(n: number) {
  return n.toString().padStart(2, "0");
}

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

/* =========================================================
   Leaf Divider Component
   ========================================================= */
function CalendarLeafLine() {
  return (
    <div className="calendar-leaf-line">
      <svg viewBox="0 0 320 34" aria-hidden="true" preserveAspectRatio="none">
        <g fill="currentColor">
          <path d="M10 19 C8 16,3 16,2 19 C3 22,8 22,10 19 Z" transform="translate(6 19) rotate(-9) scale(0.92) translate(-6 -19)" opacity="0.45" />
          <path d="M318 19 C316 16,311 16,310 19 C311 22,316 22,318 19 Z" transform="translate(314 19) rotate(11) scale(0.92) translate(-314 -19)" opacity="0.45" />
          <path d="M18 20 C16 17,11 17,10 20 C11 23,16 23,18 20 Z" transform="translate(14 20) rotate(-14) scale(1.02) translate(-14 -20)" opacity="0.55" />
          <path d="M34 15 C32 12,27 12,26 15 C27 18,32 18,34 15 Z" transform="translate(30 15) rotate(18) scale(0.86) translate(-30 -15)" opacity="0.42" />
          <path d="M52 22 C50 19,45 19,44 22 C45 25,50 25,52 22 Z" transform="translate(48 22) rotate(-8) scale(0.98) translate(-48 -22)" opacity="0.52" />
          <path d="M70 14 C68 11,63 11,62 14 C63 17,68 17,70 14 Z" transform="translate(66 14) rotate(22) scale(0.88) translate(-66 -14)" opacity="0.46" />
          <path d="M90 21 C88 18,82 18,81 21 C82 24,88 24,90 21 Z" transform="translate(85.5 21) rotate(-12) scale(1.0) translate(-85.5 -21)" opacity="0.58" />
          <path d="M112 14 C110 11,105 11,104 14 C105 17,110 17,112 14 Z" transform="translate(108 14) rotate(6) scale(0.8) translate(-108 -14)" opacity="0.38" />
          <path d="M132 19 C130 16,125 16,124 19 C125 22,130 22,132 19 Z" transform="translate(128 19) rotate(-18) scale(0.9) translate(-128 -19)" opacity="0.48" />
          <path d="M152 13 C150 10,145 10,144 13 C145 16,150 16,152 13 Z" transform="translate(148 13) rotate(12) scale(0.86) translate(-148 -13)" opacity="0.44" />
          <path d="M172 19 C170 16,165 16,164 19 C165 22,170 22,172 19 Z" transform="translate(168 19) rotate(-14) scale(0.9) translate(-168 -19)" opacity="0.5" />
          <path d="M192 13 C190 10,185 10,184 13 C185 16,190 16,192 13 Z" transform="translate(188 13) rotate(-8) scale(0.84) translate(-188 -13)" opacity="0.42" />
          <path d="M212 20 C210 17,204 17,203 20 C204 23,210 23,212 20 Z" transform="translate(207.5 20) rotate(8) scale(1.02) translate(-207.5 -20)" opacity="0.56" />
          <path d="M232 15 C230 12,225 12,224 15 C225 18,230 18,232 15 Z" transform="translate(228 15) rotate(-16) scale(0.86) translate(-228 -15)" opacity="0.4" />
          <path d="M252 21 C250 18,245 18,244 21 C245 24,250 24,252 21 Z" transform="translate(248 21) rotate(20) scale(0.96) translate(-248 -21)" opacity="0.52" />
          <path d="M272 18 C270 15,265 15,264 18 C265 21,270 21,272 18 Z" transform="translate(268 18) rotate(-10) scale(0.98) translate(-268 -18)" opacity="0.54" />
          <path d="M292 18 C290 15,285 15,284 18 C285 21,290 21,292 18 Z" transform="translate(288 18) rotate(6) scale(0.96) translate(-288 -18)" opacity="0.5" />
        </g>
      </svg>
    </div>
  );
}

/* =========================================================
   Calendar Component
   ========================================================= */
export function Calendar() {
  const groomName = import.meta.env.VITE_GROOM_NAME || "신랑";
  const brideName = import.meta.env.VITE_BRIDE_NAME || "신부";

  const { year, month, day: weddingDay, hour, minute } = WEDDING;

  const weddingDate = useMemo(() => {
    const m = pad(month);
    const d = pad(weddingDay);
    const hh = pad(hour);
    const mm = pad(minute);
    return new Date(`${year}-${m}-${d}T${hh}:${mm}:00+09:00`);
  }, [year, month, weddingDay, hour, minute]);

  /* Countdown Logic */
  const [now, setNow] = useState<Date>(new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const countdown = useMemo(() => {
    const diffMs = weddingDate.getTime() - now.getTime();

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

    if (isSameKstDate(now, weddingDate)) {
      return { mode: "today" as const };
    }

    const passedDays = Math.floor(Math.abs(diffMs) / (24 * 3600 * 1000));
    return { mode: "past" as const, passedDays };
  }, [now, weddingDate]);

  /* Calendar Grid Logic */
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

  return (
    <div className="calendar-wrapper">
      
      {/* Headline */}
      <div className="calendar-headline">2026년 여름, 결혼합니다.</div>

      {/* Topline */}
      <div className="calendar-topline">
        {year}. {month}. {weddingDay}. (토) 오전 {hour}시
      </div>

      {/* Weekdays */}
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

      {/* Calendar Body */}
      <div className="calendar-box">
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
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Leaf Divider */}
      <CalendarLeafLine />

      {/* Countdown */}
      <div className="countdown-wrap">
        {/* ✨ [수정] 문구 변경: ~과 ~의 결혼식이 */}
        <div className="countdown-line1">
          <span className="highlight-name">{groomName}</span>과{" "}
          <span className="highlight-name">{brideName}</span>의 결혼식이
        </div>

        <div className="countdown-line2">
          {countdown.mode === "future" && (
            <div className="countdown-values">
              {/* ✨ [수정] 콜론 제거 */}
              <div className="unit-block">
                <span className="num">{countdown.days}</span>
                <span className="unit">일</span>
              </div>
              
              <div className="unit-block">
                <span className="num">{pad(countdown.hours)}</span>
                <span className="unit">시간</span>
              </div>
              
              <div className="unit-block">
                <span className="num">{pad(countdown.minutes)}</span>
                <span className="unit">분</span>
              </div>
              
              <div className="unit-block">
                <span className="num">{pad(countdown.seconds)}</span>
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
          {countdown.mode === "future" ? "남았습니다" : ""}
        </div>
      </div>
    </div>
  );
}

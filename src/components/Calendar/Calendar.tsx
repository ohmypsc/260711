import React, { useMemo, useEffect, useState } from "react";
import "./Calendar.scss";
import { useContactInfo } from "@/ContactInfoProvider";

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
   ✅ Cover 계열 리프 디바이더 (Calendar 내부 전용)
   - 같은 계열 느낌 유지
   - 위치 / 각도 / opacity 약간 변주
   ========================================================= */
function CalendarLeafLine({ variant }: { variant: "top" | "bottom" }) {
  const flip = variant === "bottom";
  return (
    <div className={`calendar-parent-line ${variant}`}>
      <svg viewBox="0 0 320 34" aria-hidden="true" preserveAspectRatio="none">
        <g fill="currentColor">
          {/* end caps (각도/opacity 살짝 변주) */}
          <path
            d="M10 19 C8 16,3 16,2 19 C3 22,8 22,10 19 Z"
            transform={`translate(6 19) rotate(${flip ? 4 : -10}) scale(0.92) translate(-6 -19)`}
            opacity="0.45"
          />
          <path
            d="M318 19 C316 16,311 16,310 19 C311 22,316 22,318 19 Z"
            transform={`translate(314 19) rotate(${flip ? -6 : 12}) scale(0.92) translate(-314 -19)`}
            opacity="0.45"
          />

          {/* leaves (커버 계열인데 배치/각도 약간 다름) */}
          <path
            d="M18 20 C16 17,11 17,10 20 C11 23,16 23,18 20 Z"
            transform={`translate(14 20) rotate(${flip ? 10 : -16}) scale(1.02) translate(-14 -20)`}
            opacity="0.55"
          />
          <path
            d="M36 15 C34 12,29 12,28 15 C29 18,34 18,36 15 Z"
            transform={`translate(32 15) rotate(${flip ? -12 : 18}) scale(0.82) translate(-32 -15)`}
            opacity="0.4"
          />
          <path
            d="M56 22 C54 19,49 19,48 22 C49 25,54 25,56 22 Z"
            transform={`translate(52 22) rotate(${flip ? 6 : -8}) scale(0.98) translate(-52 -22)`}
            opacity="0.52"
          />
          <path
            d="M78 14 C76 11,71 11,70 14 C71 17,76 17,78 14 Z"
            transform={`translate(74 14) rotate(${flip ? 22 : -20}) scale(0.86) translate(-74 -14)`}
            opacity="0.46"
          />
          <path
            d="M98 21 C96 18,90 18,89 21 C90 24,96 24,98 21 Z"
            transform={`translate(93.5 21) rotate(${flip ? -14 : 12}) scale(1.0) translate(-93.5 -21)`}
            opacity="0.58"
          />

          <path
            d="M148 14 C146 11,141 11,140 14 C141 17,146 17,148 14 Z"
            transform={`translate(144 14) rotate(${flip ? -8 : 14}) scale(0.9) translate(-144 -14)`}
            opacity="0.46"
          />
          <path
            d="M170 19 C168 16,163 16,162 19 C163 22,168 22,170 19 Z"
            transform={`translate(166 19) rotate(${flip ? 16 : -14}) scale(0.92) translate(-166 -19)`}
            opacity="0.5"
          />
          <path
            d="M188 13 C186 10,181 10,180 13 C181 16,186 16,188 13 Z"
            transform={`translate(184 13) rotate(${flip ? 12 : -10}) scale(0.86) translate(-184 -13)`}
            opacity="0.42"
          />

          <path
            d="M214 20 C212 17,206 17,205 20 C206 23,212 23,214 20 Z"
            transform={`translate(209.5 20) rotate(${flip ? -10 : 8}) scale(1.02) translate(-209.5 -20)`}
            opacity="0.56"
          />
          <path
            d="M236 15 C234 12,229 12,228 15 C229 18,234 18,236 15 Z"
            transform={`translate(232 15) rotate(${flip ? 18 : -16}) scale(0.82) translate(-232 -15)`}
            opacity="0.38"
          />
          <path
            d="M258 21 C256 18,251 18,250 21 C251 24,256 24,258 21 Z"
            transform={`translate(254 21) rotate(${flip ? -6 : 20}) scale(0.96) translate(-254 -21)`}
            opacity="0.52"
          />
          <path
            d="M282 18 C280 15,275 15,274 18 C275 21,280 21,282 18 Z"
            transform={`translate(278 18) rotate(${flip ? 8 : -12}) scale(0.98) translate(-278 -18)`}
            opacity="0.54"
          />

          {/* tiny leaves */}
          <path
            d="M56 8 C54 6,51 6,50 8 C51 10,54 10,56 8 Z"
            transform="translate(53 8) rotate(18) scale(0.6) translate(-53 -8)"
            opacity="0.18"
          />
          <path
            d="M262 7 C260 5,257 5,256 7 C257 9,260 9,262 7 Z"
            transform="translate(259 7) rotate(-12) scale(0.6) translate(-259 -7)"
            opacity="0.18"
          />
        </g>
      </svg>
    </div>
  );
}

/* =========================================================
   Calendar Component
   ========================================================= */
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

  /* =========================
     Countdown
     ========================= */
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

  /* =========================
     Calendar grid
     ========================= */
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

  const timeText = minute === 0 ? `${hour}시` : `${hour}시 ${minute}분`;

  return (
    <div className="calendar-container">
      {/* =========================================================
         Headline
         ========================================================= */}
      <div className="calendar-headline">2026년 여름, 결혼합니다.</div>

      {/* =========================================================
         Topline
         ========================================================= */}
      <div className="calendar-topline">
        {year}. {month}. {weddingDay}. (토) 오전 {hour}시
      </div>

      {/* =========================================================
         Weekdays
         ========================================================= */}
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

      {/* =========================================================
         Calendar Body
         ========================================================= */}
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

                    {/* ✅ 11일 하트 */}
                    {isWeddingDay && (
                      <span className="heart" aria-hidden>
                        <i className="fa-solid fa-heart" />
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================
         ✅ Leaf Divider (달력 ↔ 카운트다운 사이)
         ========================================================= */}
      <div className="calendar-leaf-divider">
        <CalendarLeafLine variant="top" />
        <CalendarLeafLine variant="bottom" />
      </div>

      {/* =========================================================
         Countdown
         ========================================================= */}
      <div className="countdown-wrap">
        <div className="countdown-line1">
          {groomName}과 {brideName}의 결혼식이
        </div>

        <div className="countdown-line2">
          {countdown.mode === "future" && (
            <div className="countdown-values">
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
            <div className="countdown-status">오늘입니다🎉</div>
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

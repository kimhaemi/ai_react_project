"use client";

import { useState } from "react";
import { Calendar, DatePicker } from "@/components/ui";
import { addDays, parseDate } from "@/lib/date";
import { useToday } from "@/lib/useToday";
import { DemoPage, DemoSection, ValueView } from "./Demo";

const isWeekend = (d: string) => [0, 6].includes(parseDate(d).getDay());

export default function CalendarDemo() {
  const todayStr = useToday();
  const [inline, setInline] = useState<string | null>(null);
  const [birth, setBirth] = useState<string | null>(null);
  const [reserve, setReserve] = useState<string | null>(null);

  return (
    <DemoPage
      title="Calendar / DatePicker"
      description="날짜 하나를 고르는 달력입니다. 값은 'YYYY-MM-DD' 문자열입니다. 키보드: 방향키 이동, PageUp/PageDown 달 이동, Enter 선택, Esc 닫기."
    >
      <DemoSection title="달력 (화면에 바로 표시)" code={`<Calendar value={date} onChange={setDate} />`}>
        <div className="flex flex-wrap items-start gap-6">
          <div className="rounded-lg border border-gray-200 p-3">
            <Calendar value={inline} onChange={setInline} />
          </div>
          <ValueView value={inline} />
        </div>
      </DemoSection>

      <DemoSection
        title="DatePicker (입력창 + 달력 팝업)"
        code={`const todayStr = useToday(); // 렌더링 중에는 today() 대신 useToday()
<DatePicker label="생년월일" value={date} onChange={setDate} max={todayStr ?? undefined} clearable />
<DatePicker label="예약일" min={addDays(todayStr, 1)} max={addDays(todayStr, 60)} isDateDisabled={isWeekend} ... />`}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <DatePicker label="생년월일" value={birth} onChange={setBirth} max={todayStr ?? undefined} clearable hint="오늘 이후는 선택할 수 없습니다." />
          <DatePicker
            label="예약일"
            required
            value={reserve}
            onChange={setReserve}
            min={todayStr ? addDays(todayStr, 1) : undefined}
            max={todayStr ? addDays(todayStr, 60) : undefined}
            isDateDisabled={isWeekend}
            error={reserve ? undefined : "예약일을 선택하세요."}
            hint="내일부터 60일 이내 평일만 선택할 수 있습니다."
          />
        </div>
        <ValueView value={{ birth, reserve }} />
      </DemoSection>
    </DemoPage>
  );
}

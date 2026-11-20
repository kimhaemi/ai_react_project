"use client";

import { useState } from "react";
import { DateRangePicker, RangeCalendar, type DateRange } from "@/components/ui";
import { addDays } from "@/lib/date";
import { useToday } from "@/lib/useToday";
import { DemoPage, DemoSection, ValueView } from "../_shared/Demo";

export default function DateRangeDemo() {
  const todayStr = useToday();
  // 처음에는 최근 7일을 보여줌 (오늘 날짜는 브라우저에서만 알 수 있음)
  const [picked, setInline] = useState<DateRange | null>(null);
  const inline: DateRange = picked ?? (todayStr ? { from: addDays(todayStr, -6), to: todayStr } : { from: null, to: null });
  const [period, setPeriod] = useState<DateRange>({ from: null, to: null });
  const [stay, setStay] = useState<DateRange>({ from: null, to: null });

  return (
    <DemoPage
      title="RangeCalendar / DateRangePicker"
      description="시작일과 종료일을 고르는 기간 달력입니다. 첫 번째 클릭이 시작일, 두 번째 클릭이 종료일이며 거꾸로 고르면 자동으로 바꿉니다. PC 에서는 두 달을 함께 보여줍니다."
    >
      <DemoSection title="기간 달력 (화면에 바로 표시)" code={`<RangeCalendar value={range} onChange={setRange} />`}>
        <div className="overflow-x-auto rounded-lg border border-gray-200 p-3">
          <RangeCalendar value={inline} onChange={setInline} />
        </div>
        <ValueView value={inline} />
      </DemoSection>

      <DemoSection
        title="DateRangePicker (입력창 + 팝업)"
        description="기본으로 빠른 선택(오늘, 최근 7일, 1개월, 3개월)이 들어 있습니다. 검색박스의 기간 항목도 이 컴포넌트를 씁니다."
        code={`const todayStr = useToday(); // 렌더링 중에는 today() 대신 useToday()
<DateRangePicker label="조회 기간" value={range} onChange={setRange} max={todayStr ?? undefined} clearable />
<DateRangePicker label="숙박 기간" presets={false} min={todayStr ?? undefined} ... />`}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <DateRangePicker label="조회 기간" value={period} onChange={setPeriod} max={todayStr ?? undefined} clearable />
          <DateRangePicker
            label="숙박 기간"
            value={stay}
            onChange={setStay}
            presets={false}
            min={todayStr ?? undefined}
            placeholder="체크인 ~ 체크아웃"
            hint="빠른 선택 없이, 오늘 이후만 선택"
          />
        </div>
        <ValueView value={{ period, stay }} />
      </DemoSection>
    </DemoPage>
  );
}

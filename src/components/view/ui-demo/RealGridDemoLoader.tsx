"use client";

import dynamic from "next/dynamic";
import DemoSkeleton from "./DemoSkeleton";

/** realgrid 는 브라우저 전용 라이브러리라 서버 렌더링을 끄고 불러옴 */
const RealGridDemo = dynamic(() => import("./RealGridDemo"), { ssr: false, loading: () => <DemoSkeleton page="grid" /> });

export default function RealGridDemoLoader() {
  return <RealGridDemo />;
}

"use client";

import dynamic from "next/dynamic";
import DemoSkeleton from "./DemoSkeleton";

/**
 * 브라우저 전용 그리드(캔버스·웹 컴포넌트·DOM 직접 조작)는 서버 렌더링을 끄고 불러옴.
 * dynamic() 은 모듈 최상단에서 경로를 글자 그대로 적어야 해서 그리드별로 따로 선언.
 */
const loading = () => <DemoSkeleton page="grid" />;

export const GlideGridDemo = dynamic(() => import("./GlideGridDemo"), { ssr: false, loading });
export const RevoGridDemo = dynamic(() => import("./RevoGridDemo"), { ssr: false, loading });
export const TabulatorDemo = dynamic(() => import("./TabulatorDemo"), { ssr: false, loading });
export const TanStackTableDemo = dynamic(() => import("./TanStackTableDemo"), { ssr: false, loading });
export const MuiGridDemo = dynamic(() => import("./MuiGridDemo"), { ssr: false, loading });

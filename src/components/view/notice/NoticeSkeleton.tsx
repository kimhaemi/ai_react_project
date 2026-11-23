import { Skeleton, SkeletonGrid, SkeletonScreen } from "@/components/ui";

/** 공지사항 목록 표 자리 (첫 조회 중에 그리드 대신 표시) */
export function NoticeGridSkeleton() {
  return <SkeletonGrid rows={12} columns={6} className="h-[600px]" />;
}

/** 공지사항 화면을 불러오는 동안 보이는 스켈레톤 */
export default function NoticeSkeleton() {
  return (
    <SkeletonScreen className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <Skeleton className="mb-6 h-8 w-32" />
      <div className="flex flex-col gap-4">
        {/* 검색 영역 */}
        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-t-lg bg-gray-200 md:grid-cols-2">
            {[0, 1].map((i) => (
              <div key={i} className="flex bg-white">
                <div className="flex w-24 shrink-0 items-center bg-gray-50 px-3 sm:w-28">
                  <Skeleton className="h-3.5 w-12" />
                </div>
                <div className="flex min-h-12 flex-1 items-center px-3 py-2">
                  <Skeleton className="h-9 w-full" />
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 border-t border-gray-200 px-3 py-2.5">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
        {/* 건수 + 버튼 */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-16" />
          <div className="ml-auto flex gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
        <NoticeGridSkeleton />
      </div>
    </SkeletonScreen>
  );
}

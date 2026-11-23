import { Skeleton, SkeletonCard, SkeletonScreen, SkeletonText } from "@/components/ui";

/** 공통 UI 예시 화면(DemoPage) 모양의 스켈레톤 */
export default function DemoSkeleton() {
  return (
    <SkeletonScreen className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8">
      <div>
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-2 h-4 w-full max-w-lg" />
      </div>
      {[0, 1, 2].map((i) => (
        <SkeletonCard key={i} className="p-0">
          <div className="border-b border-gray-100 px-5 py-3">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="mt-1.5 h-3.5 w-64 max-w-full" />
          </div>
          <div className="flex flex-col gap-4 p-5">
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
            </div>
            <SkeletonText lines={2} />
          </div>
          <div className="border-t border-gray-100 bg-gray-50 px-5 py-3">
            <SkeletonText lines={3} className="max-w-md" />
          </div>
        </SkeletonCard>
      ))}
    </SkeletonScreen>
  );
}

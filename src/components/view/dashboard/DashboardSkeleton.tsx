import { Skeleton, SkeletonScreen } from "@/components/ui";

/** 대시보드 화면을 불러오는 동안 보이는 스켈레톤 */
export default function DashboardSkeleton() {
  return (
    <SkeletonScreen className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <Skeleton className="mb-3 h-8 w-40" />
      <Skeleton className="h-4 w-full max-w-md" />
    </SkeletonScreen>
  );
}

import { Skeleton, SkeletonScreen } from "@/components/ui";

/** 로그인 화면을 불러오는 동안 보이는 스켈레톤 */
export default function LoginSkeleton() {
  return (
    <SkeletonScreen className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <Skeleton className="size-12 rounded-xl" />
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4">
            {[0, 1].map((i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <Skeleton className="h-4 w-14" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-1 h-10 w-full" />
          </div>
          <Skeleton className="mx-auto my-6 h-3 w-24" />
          <div className="flex justify-center gap-5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <Skeleton className="size-12 rounded-full" />
                <Skeleton className="h-3 w-10" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </SkeletonScreen>
  );
}

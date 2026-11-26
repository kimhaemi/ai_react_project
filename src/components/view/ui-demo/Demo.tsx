import type { ReactNode } from "react";

export function DemoPage({
  title,
  description,
  wide = false,
  children,
}: {
  title: string;
  description: string;
  /** 넓은 표 등 화면 폭을 다 써야 하는 페이지 */
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <main className={`mx-auto flex w-full flex-1 flex-col gap-6 px-4 py-8 ${wide ? "max-w-[1600px]" : "max-w-5xl"}`}>
      <header>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="mt-1 text-gray-600">{description}</p>
      </header>
      {children}
    </main>
  );
}

export function DemoSection({ title, description, children, code }: { title: string; description?: string; children: ReactNode; code?: string }) {
  return (
    <section className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-100 px-5 py-3">
        <h2 className="font-semibold">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-gray-500">{description}</p>}
      </div>
      <div className="p-5">{children}</div>
      {code && (
        <pre className="overflow-x-auto border-t border-gray-100 bg-gray-50 px-5 py-3 text-xs leading-relaxed text-gray-700">
          <code>{code.trim()}</code>
        </pre>
      )}
    </section>
  );
}

/** 현재 값 표시 */
export function ValueView({ value }: { value: unknown }) {
  return (
    <p className="mt-4 rounded bg-gray-50 px-3 py-2 font-mono text-xs text-gray-600">
      value: {JSON.stringify(value)}
    </p>
  );
}

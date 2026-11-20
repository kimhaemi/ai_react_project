"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { type SocialProvider } from "@/components/auth/AuthProvider";
import { GoogleIcon, KakaoIcon, NaverIcon } from "@/components/auth/SocialIcons";
import LanguageSelect from "@/components/layout/LanguageSelect";
import { LogoIcon } from "@/components/layout/icons";
import type { MessageKey } from "@/i18n/dictionaries";
import { useAuth, useI18n, useStoredValue } from "@/hooks";

const SOCIALS: {
  provider: SocialProvider;
  labelKey: MessageKey;
  Icon: (p: { className?: string }) => React.ReactNode;
  className: string;
}[] = [
  { provider: "google", labelKey: "social.google", Icon: GoogleIcon, className: "border border-gray-300 bg-white hover:bg-gray-50" },
  { provider: "kakao", labelKey: "social.kakao", Icon: KakaoIcon, className: "bg-[#FEE500] hover:brightness-95" },
  { provider: "naver", labelKey: "social.naver", Icon: NaverIcon, className: "bg-[#03C75A] hover:brightness-95" },
];

/** 로그인 후 돌아갈 경로 (?redirect=). 외부 주소로는 이동하지 않도록 내부 경로만 허용 */
function getRedirectTarget() {
  const target = new URLSearchParams(window.location.search).get("redirect");
  return target && target.startsWith("/") && !target.startsWith("//") && target !== "/login" ? target : "/";
}

export default function LoginScreen() {
  const { t } = useI18n();
  const { user, login, loginWithSocial } = useAuth();
  const router = useRouter();
  const [savedId, setSavedId] = useStoredValue("login.savedId");

  // 사용자가 직접 입력하기 전까지는 저장된 아이디를 보여줌
  const [idInput, setIdInput] = useState<string | null>(null);
  const [rememberInput, setRememberInput] = useState<boolean | null>(null);
  const id = idInput ?? savedId ?? "";
  const remember = rememberInput ?? savedId != null;

  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<"local" | SocialProvider | null>(null);

  // 로그인되면(이미 로그인된 상태 포함) 원래 페이지로 이동
  useEffect(() => {
    if (user) router.replace(getRedirectTarget());
  }, [user, router]);

  const submit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id.trim() || !password) return setError(t("login.required"));
    setError(null);
    setPending("local");
    try {
      setSavedId(remember ? id.trim() : null);
      await login(id.trim(), password);
    } catch {
      setError(t("login.failed"));
      setPending(null);
    }
  };

  const social = async (provider: SocialProvider) => {
    setError(null);
    setPending(provider);
    try {
      await loginWithSocial(provider);
    } catch {
      setError(t("login.failed"));
      setPending(null);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <LanguageSelect className="absolute top-4 right-4" />

      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Link href="/" aria-label={t("login.backHome")}>
            <LogoIcon className="size-12" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{t("app.name")}</h1>
          <p className="text-sm text-gray-500">{t("login.subtitle")}</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
              {t("login.id")}
              <input
                autoFocus
                autoComplete="username"
                value={id}
                onChange={(e) => setIdInput(e.target.value)}
                placeholder={t("login.idPlaceholder")}
                className="rounded-md border border-gray-300 px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
              {t("login.password")}
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("login.passwordPlaceholder")}
                className="rounded-md border border-gray-300 px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRememberInput(e.target.checked)}
                className="size-4 accent-blue-600"
              />
              {t("login.remember")}
            </label>

            {error && (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending !== null}
              className="mt-1 rounded-md bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {pending === "local" ? t("login.submitting") : t("login.submit")}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-gray-400">
            <span className="h-px flex-1 bg-gray-200" />
            {t("login.social")}
            <span className="h-px flex-1 bg-gray-200" />
          </div>

          <ul className="flex justify-center gap-5">
            {SOCIALS.map(({ provider, labelKey, Icon, className }) => {
              const label = t("login.with", { provider: t(labelKey) });
              return (
                <li key={provider} className="flex flex-col items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => social(provider)}
                    disabled={pending !== null}
                    aria-label={label}
                    title={label}
                    className={`flex size-12 items-center justify-center rounded-full transition disabled:opacity-50 ${className}`}
                  >
                    <Icon className="size-6" />
                  </button>
                  <span className="text-xs text-gray-500">{t(labelKey)}</span>
                </li>
              );
            })}
          </ul>

          <p className="mt-6 text-center text-xs text-gray-400">{t("login.hint")}</p>
        </div>

        <p className="mt-6 text-center text-sm">
          <Link href="/" className="text-gray-500 hover:text-gray-700 hover:underline">
            {t("login.backHome")}
          </Link>
        </p>
      </div>
    </main>
  );
}

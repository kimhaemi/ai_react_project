/**
 * 공통 훅 모음. 화면(components/view)·레이아웃에서는 여기서 import
 *   import { useUI, useI18n, useAuth } from "@/hooks";
 *
 * - 독립 훅은 이 폴더에 파일로 둠 (useUI, useToday, useStoredValue, useDismiss)
 * - Provider 의 context 를 쓰는 훅은 Provider 파일에 두고 여기서 다시 내보냄
 * - components/ui, lib 안에서는 순환 참조를 피하려고 개별 파일(@/hooks/useDismiss 등)을 import
 */
export { useUI, type RunOptions, type UI } from "./useUI";
export { useToday } from "./useToday";
export { useStoredValue } from "./useStoredValue";
export { useDismiss } from "./useDismiss";

export { useToast } from "@/components/ui/Toast";
export { useDialog } from "@/components/ui/Dialog";
export { useLoading } from "@/components/ui/Loading";
export { useI18n } from "@/i18n/I18nProvider";
export { useAuth } from "@/components/auth/AuthProvider";

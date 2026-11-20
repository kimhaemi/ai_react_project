// 각 사 브랜드 가이드의 공식 색상을 사용한 소셜 로그인 아이콘
type P = { className?: string };

export const GoogleIcon = ({ className = "size-6" }: P) => (
  <svg viewBox="0 0 48 48" className={className} aria-hidden>
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);

export const KakaoIcon = ({ className = "size-6" }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden>
    <path
      fill="#000000"
      d="M12 3C6.48 3 2 6.54 2 10.9c0 2.82 1.88 5.3 4.7 6.7-.2.75-.75 2.72-.86 3.14-.13.52.19.51.4.37.17-.11 2.64-1.8 3.71-2.53.67.1 1.35.15 2.05.15 5.52 0 10-3.54 10-7.9C22 6.54 17.52 3 12 3z"
    />
  </svg>
);

export const NaverIcon = ({ className = "size-6" }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden>
    <path fill="#FFFFFF" d="M15.56 12.84 8.2 2.25H2.25v19.5h6.19V11.16l7.36 10.59h5.95V2.25h-6.19z" transform="scale(.75) translate(4 4)" />
  </svg>
);

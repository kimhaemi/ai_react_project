import type { Metadata } from "next";
import LoginScreen from "@/screens/auth/LoginScreen";

export const metadata: Metadata = { title: "로그인" };

export default function Page() {
  return <LoginScreen />;
}

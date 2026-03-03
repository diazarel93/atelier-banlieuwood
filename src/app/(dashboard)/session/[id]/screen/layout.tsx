import { DarkLayout } from "@/components/dark-layout";

export default function ScreenLayout({ children }: { children: React.ReactNode }) {
  return <DarkLayout>{children}</DarkLayout>;
}

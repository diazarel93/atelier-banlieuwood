import { DarkLayout } from "@/components/dark-layout";

export default function PlayLayout({ children }: { children: React.ReactNode }) {
  return <DarkLayout>{children}</DarkLayout>;
}

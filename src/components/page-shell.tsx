import { cn } from "@/lib/utils";

const maxWidthMap = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-4xl",
  xl: "max-w-5xl",
} as const;

interface PageShellProps {
  maxWidth?: keyof typeof maxWidthMap;
  withPaper?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function PageShell({
  maxWidth = "lg",
  withPaper = true,
  className,
  children,
}: PageShellProps) {
  return (
    <div
      className={cn(
        "min-h-dvh page-enter",
        withPaper ? "bg-studio" : "bg-bw-bg",
        className
      )}
    >
      <main
        className={cn(
          maxWidthMap[maxWidth],
          "mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8"
        )}
      >
        {children}
      </main>
    </div>
  );
}

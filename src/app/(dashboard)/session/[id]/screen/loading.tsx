export default function ScreenLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bw-bg">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-bw-border border-t-bw-primary" />
        <p className="text-sm text-bw-muted animate-pulse">Préparation de l'écran…</p>
      </div>
    </div>
  );
}

// ——— Confetti helper ———
export function fireConfetti() {
  import("canvas-confetti").then((mod) =>
    mod.default({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#FF6B35", "#4ECDC4", "#D4A843", "#8B5CF6", "#F59E0B"],
    }),
  );
  if (navigator.vibrate) navigator.vibrate([15, 50, 15]);
}

export function haptic(ms = 10) {
  if (navigator.vibrate) navigator.vibrate(ms);
}

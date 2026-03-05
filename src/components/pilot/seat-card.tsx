"use client";

import { memo } from "react";
import type { StudentState } from "./pulse-ring";

export interface SeatStudent {
  id: string;
  display_name: string;
  avatar: string;
  state: StudentState;
  hand_raised_at?: string | null;
  warnings?: number;
}

export const SeatCard = memo(function SeatCardInner({
  student,
  lastResponse,
  onClick,
}: {
  student: SeatStudent;
  lastResponse: string | null;
  onClick: () => void;
}) {
  return null; // Deprecated — use DeskPair
});

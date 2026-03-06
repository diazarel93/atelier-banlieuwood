import type { StudentState } from "./pulse-ring";

export interface SeatStudent {
  id: string;
  display_name: string;
  avatar: string;
  state: StudentState;
  hand_raised_at?: string | null;
  warnings?: number;
}

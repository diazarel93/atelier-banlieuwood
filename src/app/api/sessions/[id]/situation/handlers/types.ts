import type { NextRequest } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AdminClient = SupabaseClient<any, any, any>;

export type ModuleHandler = (
  req: NextRequest,
  session: Record<string, unknown>,
  sessionId: string,
  admin: AdminClient,
) => Promise<Response>;

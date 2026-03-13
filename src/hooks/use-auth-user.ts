import { useQuery } from "@tanstack/react-query";
import type { AuthUser } from "@/lib/auth";

async function fetchAuthUser(): Promise<AuthUser> {
  const res = await fetch("/api/auth/me");
  if (!res.ok) throw new Error("Not authenticated");
  return res.json();
}

export function useAuthUser() {
  return useQuery({
    queryKey: ["auth-user"],
    queryFn: fetchAuthUser,
    staleTime: 60_000,
    retry: false,
  });
}

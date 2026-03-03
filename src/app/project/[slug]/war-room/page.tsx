"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function WarRoomPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  useEffect(() => {
    router.replace(`/project/${slug}/war-room/episodes`);
  }, [slug, router]);

  return null;
}

"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AtelierPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  useEffect(() => {
    router.replace(`/project/${slug}/atelier/histoire`);
  }, [slug, router]);

  return null;
}

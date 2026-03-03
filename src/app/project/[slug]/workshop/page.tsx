"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function WorkshopPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  useEffect(() => {
    router.replace(`/project/${slug}/workshop/table-read`);
  }, [slug, router]);

  return null;
}

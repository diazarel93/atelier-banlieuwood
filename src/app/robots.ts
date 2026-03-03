import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard/", "/session/", "/play/"],
      },
    ],
    sitemap: "https://banlieuwood.fr/sitemap.xml",
  };
}

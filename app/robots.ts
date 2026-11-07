import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://tovio.in";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/onboarding", "/admin", "/enquiry", "/auth"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}

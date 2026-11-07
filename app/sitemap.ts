import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://tovio.in";
  return ["", "/find", "/how-it-works", "/about", "/contact", "/privacy", "/terms"].map((path) => ({
    url: `${base}${path || "/"}`,
    changeFrequency: "weekly",
  }));
}

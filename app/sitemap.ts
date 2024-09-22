import { MetadataRoute } from "next";


export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://colourclouds.ng",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1,
    },
    {
      url: "https://colourclouds.ng/docs",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://colourclouds.ng/inators",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
  ];
}

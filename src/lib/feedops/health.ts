import { getChannelOpsStatus } from "@/src/lib/channelops/channels";

export type FeedOpsHealth = {
  generatedAt: string;
  feeds: Array<{ route: string; format: "csv" | "xml" | "json"; source: string; status: "active" }>;
  channels: ReturnType<typeof getChannelOpsStatus>;
};

export function getFeedOpsHealth(): FeedOpsHealth {
  return {
    generatedAt: new Date().toISOString(),
    feeds: [
      { route: "/meta/catalog.csv", format: "csv", source: "public-catalog", status: "active" },
      { route: "/feeds/meta-catalog.csv", format: "csv", source: "smart-store", status: "active" },
      { route: "/feeds/google-shopping.xml", format: "xml", source: "smart-store", status: "active" },
      { route: "/feeds/google-shopping.csv", format: "csv", source: "smart-store", status: "active" },
      { route: "/feeds/produtos.json", format: "json", source: "smart-store", status: "active" },
      { route: "/feeds/products.json", format: "json", source: "smart-store", status: "active" },
      { route: "/sitemap-products.xml", format: "xml", source: "public-catalog+smart-store", status: "active" },
      { route: "/merchant/products.xml", format: "xml", source: "public-catalog", status: "active" },
    ],
    channels: getChannelOpsStatus(),
  };
}

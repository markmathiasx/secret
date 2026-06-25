import { buildMetaCommerceCsv, buildMetaCommerceFeedData } from "@/lib/meta-commerce-feed";
import { buildGoogleShoppingXml } from "@/lib/mdh-store/feeds";
import { getLocalStoreProducts } from "@/lib/mdh-store/products";
import { getSiteUrl } from "@/lib/env";
import { buildCacheKey } from "@/src/lib/platform/cache/keys";
import { readThroughDal } from "@/src/lib/platform/data/dal";

export function getMetaFeedDal() {
  return readThroughDal("feed.meta", buildCacheKey("feed:meta"), () => {
    const data = buildMetaCommerceFeedData();
    return { data, csv: buildMetaCommerceCsv(data.products) };
  }, { ttlSeconds: 900, source: "Meta Commerce feed builder" });
}

export function getGoogleFeedDal() {
  return readThroughDal("feed.google", buildCacheKey("feed:google"), () => buildGoogleShoppingXml(getLocalStoreProducts(), getSiteUrl()), {
    ttlSeconds: 900,
    source: "Google Shopping feed builder",
  });
}

export function getProductsFeedDal() {
  return readThroughDal("feed.products", buildCacheKey("feed:products"), () => getLocalStoreProducts(), {
    ttlSeconds: 900,
    source: "data/produtos.csv",
  });
}

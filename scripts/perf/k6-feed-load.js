import http from "k6/http";
import { check } from "k6";

export const options = { vus: 50, duration: "30s" };

export default function feedLoadTest() {
  const base = __ENV.BASE_URL || "https://www.mdh3d.com.br";
  for (const route of ["/meta/catalog.csv", "/feeds/google-shopping.xml"]) {
    const res = http.get(`${base}${route}`);
    check(res, { [`${route} status ok`]: (r) => r.status === 200 && !String(r.body).includes("<html") });
  }
}

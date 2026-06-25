import http from "k6/http";
import { check } from "k6";

export const options = { vus: 50, duration: "30s" };

export default function smokeLoadTest() {
  const base = __ENV.BASE_URL || "https://www.mdh3d.com.br";
  const res = http.get(base);
  check(res, { "home status ok": (r) => r.status >= 200 && r.status < 400 });
}

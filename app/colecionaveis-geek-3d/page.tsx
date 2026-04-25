import type { Metadata } from "next";
import { SalesLandingShell } from "@/components/sales-landing-shell";
import { getSalesLandingMetadata, salesLandings } from "@/lib/sales-landings";

const config = salesLandings.geek;

export const metadata: Metadata = getSalesLandingMetadata(config);

export default async function ColecionaveisGeek3DPage() {
  return SalesLandingShell({ landingKey: "geek" });
}

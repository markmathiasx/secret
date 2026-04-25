import type { Metadata } from "next";
import { SalesLandingShell } from "@/components/sales-landing-shell";
import { getSalesLandingMetadata, salesLandings } from "@/lib/sales-landings";

const config = salesLandings.brindes;

export const metadata: Metadata = getSalesLandingMetadata(config);

export default async function BrindesPersonalizados3DPage() {
  return SalesLandingShell({ landingKey: "brindes" });
}

import type { Metadata } from "next";
import { SalesLandingShell } from "@/components/sales-landing-shell";
import { getSalesLandingMetadata, salesLandings } from "@/lib/sales-landings";

const config = salesLandings.decoracao;

export const metadata: Metadata = getSalesLandingMetadata(config);

export default async function Decoracao3DParaCasaPage() {
  return SalesLandingShell({ landingKey: "decoracao" });
}

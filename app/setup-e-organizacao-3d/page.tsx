import type { Metadata } from "next";
import { SalesLandingShell } from "@/components/sales-landing-shell";
import { getSalesLandingMetadata, salesLandings } from "@/lib/sales-landings";

const config = salesLandings.setup;

export const metadata: Metadata = getSalesLandingMetadata(config);

export default async function SetupEOrganizacao3DPage() {
  return SalesLandingShell({ landingKey: "setup" });
}

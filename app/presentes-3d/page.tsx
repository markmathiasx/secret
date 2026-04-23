import type { Metadata } from "next";
import { SalesLandingShell } from "@/components/sales-landing-shell";
import { getSalesLandingMetadata, salesLandings } from "@/lib/sales-landings";

const config = salesLandings.presentes;

export const metadata: Metadata = getSalesLandingMetadata(config);

export default function Presentes3DPage() {
  return <SalesLandingShell landingKey="presentes" />;
}

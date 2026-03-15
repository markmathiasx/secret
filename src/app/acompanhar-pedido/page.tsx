import type { Metadata } from "next";
import { OrderTrackingPage } from "@/components/order-tracking-page";

type TrackingPageProps = {
  searchParams: Promise<{ order?: string }>;
};

export default async function TrackingPage({ searchParams }: TrackingPageProps) {
  const params = await searchParams;
  return <OrderTrackingPage initialOrderNumber={params.order || ""} />;
}

export const metadata: Metadata = {
  title: "Acompanhar pedido",
  robots: {
    index: false,
    follow: false
  }
};

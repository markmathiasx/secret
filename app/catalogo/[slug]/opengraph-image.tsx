import { ImageResponse } from "next/og";
import { findCatalogProductBySlug } from "@/lib/catalog-repository";
import { calculateCardPrice } from "@/lib/payment-pricing";

export const runtime = "nodejs";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };
export const alt = "MDH 3D Store";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = (await findCatalogProductBySlug(slug)) ?? null;

  const name = product?.name ?? "MDH 3D Store";
  const subtitle = product
    ? `Pix R$ ${product.pricePix.toFixed(2).replace(".", ",")} | Cartão + R$ 1 R$ ${calculateCardPrice(product.pricePix).toFixed(2).replace(".", ",")}`
    : "Impressão 3D Profissional · Rio de Janeiro";

  const badge = product?.category ?? "MDH 3D";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          background: "linear-gradient(135deg, #0d1824 0%, #0f2233 50%, #071018 100%)",
          padding: 60,
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Grid accent */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle at 70% 30%, rgba(103,232,249,0.08) 0%, transparent 60%)",
          }}
        />
        {/* Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              background: "rgba(103,232,249,0.12)",
              border: "1px solid rgba(103,232,249,0.25)",
              borderRadius: 9999,
              padding: "6px 18px",
              fontSize: 14,
              fontWeight: 700,
              color: "#67e8f9",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {badge}
          </div>
        </div>
        {/* Title */}
        <div
          style={{
            fontSize: name.length > 40 ? 44 : 56,
            fontWeight: 900,
            color: "#ffffff",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            marginBottom: 20,
            maxWidth: 900,
          }}
        >
          {name}
        </div>
        {/* Subtitle */}
        <div
          style={{
            fontSize: 22,
            color: "rgba(255,255,255,0.6)",
            fontWeight: 500,
            marginBottom: 40,
          }}
        >
          {subtitle}
        </div>
        {/* Brand footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "rgba(103,232,249,0.15)",
              border: "1px solid rgba(103,232,249,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ color: "#67e8f9", fontSize: 18, fontWeight: 900 }}>M</div>
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>
            mdh3d.com.br
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}

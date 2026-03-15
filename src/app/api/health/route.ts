import { NextResponse } from "next/server";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { sql } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/db/client";
import { catalog } from "@/lib/catalog";
import { isDirectSupabaseDatabaseHost } from "@/lib/database-status";

function readImageReport() {
  try {
    const reportPath = resolve(process.cwd(), "public", "catalog-assets", "catalog-image-report.json");
    if (!existsSync(reportPath)) return null;
    return JSON.parse(readFileSync(reportPath, "utf8")) as {
      counters?: {
        imported?: number;
        placeholder?: number;
        failed?: number;
      };
      items?: Array<unknown>;
    };
  } catch {
    return null;
  }
}

export async function GET() {
  const imageDir = resolve(process.cwd(), "public", "catalog-assets");
  const imageReport = readImageReport();
  const featuredCheck = [
    "mdh-hello-kitty-organizer-desk.webp",
    "mdh-suporte-controle-duplo-desk.webp",
    "mdh-dragao-articulado-premium-plus.webp"
  ];

  const status = {
    ok: true,
    timestamp: new Date().toISOString(),
    runtime: process.env.NODE_ENV || "development",
    database: {
      configured: isDatabaseConfigured(),
      ok: false,
      detail: "DATABASE_URL ausente",
      directSupabaseHost: isDirectSupabaseDatabaseHost()
    },
    catalog: {
      curatedProducts: catalog.length,
      imageDirectoryReady: existsSync(imageDir),
      featuredAssetsReady: featuredCheck.every((file) => existsSync(resolve(imageDir, file))),
      images: imageReport
        ? {
            total: imageReport.items?.length || catalog.length,
            imported: imageReport.counters?.imported || 0,
            placeholder: imageReport.counters?.placeholder || 0,
            failed: imageReport.counters?.failed || 0
          }
        : null
    },
    integrations: {
      mercadopago: Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN),
      ga4: Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID)
    }
  };

  if (isDatabaseConfigured()) {
    try {
      const db = getDb();
      await db.execute(sql`select 1`);
      status.database = {
        configured: true,
        ok: true,
        detail: "connection_ok",
        directSupabaseHost: isDirectSupabaseDatabaseHost()
      };
    } catch (error) {
      status.ok = false;
      status.database = {
        configured: true,
        ok: false,
        detail: error instanceof Error ? error.message : "connection_failed",
        directSupabaseHost: isDirectSupabaseDatabaseHost()
      };
    }
  } else {
    status.ok = false;
  }

  return NextResponse.json(status, { status: status.ok ? 200 : 503 });
}

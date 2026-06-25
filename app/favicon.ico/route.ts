export const dynamic = "force-dynamic";

export function GET() {
  return new Response(null, {
    status: 307,
    headers: {
      Location: "/icon-192.png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

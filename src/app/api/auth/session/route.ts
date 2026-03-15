import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { customerAuthConfig } from "@/lib/constants";
import { databaseUnavailableMessage, isDatabaseRuntimeError } from "@/lib/database-status";
import { refreshCustomerSession } from "@/lib/customer-auth";
import { enforceSameOrigin, getClientIp, isSecurityError } from "@/lib/security";

function buildJsonResponse(payload: Record<string, unknown>, status = 200) {
  return NextResponse.json(payload, {
    status,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate"
    }
  });
}

export async function POST(request: Request) {
  try {
    enforceSameOrigin(request);
    const cookieStore = await cookies();
    const currentValue = cookieStore.get(customerAuthConfig.sessionCookieName)?.value;

    if (!currentValue) {
      return buildJsonResponse({ ok: true, authenticated: false });
    }

    const refreshed = await refreshCustomerSession(currentValue, {
      ipAddress: getClientIp(request.headers),
      userAgent: request.headers.get("user-agent")
    });

    if (!refreshed) {
      const response = buildJsonResponse({ ok: true, authenticated: false });
      const requestUrl = new URL(request.url);
      const forwardedProto = request.headers.get("x-forwarded-proto");
      const secureCookie = forwardedProto ? forwardedProto === "https" : requestUrl.protocol === "https:";

      response.cookies.set({
        name: customerAuthConfig.sessionCookieName,
        value: "",
        httpOnly: true,
        secure: secureCookie,
        sameSite: "strict",
        path: "/",
        maxAge: 0
      });

      return response;
    }

    const requestUrl = new URL(request.url);
    const forwardedProto = request.headers.get("x-forwarded-proto");
    const secureCookie = forwardedProto ? forwardedProto === "https" : requestUrl.protocol === "https:";
    const response = buildJsonResponse({
      ok: true,
      authenticated: true,
      customer: {
        fullName: refreshed.viewer.account.fullName,
        email: refreshed.viewer.account.email
      }
    });

    response.cookies.set({
      name: customerAuthConfig.sessionCookieName,
      value: refreshed.cookie.value,
      httpOnly: true,
      secure: secureCookie,
      sameSite: "strict",
      path: "/",
      expires: new Date(refreshed.cookie.expiresAt)
    });

    return response;
  } catch (error) {
    if (isSecurityError(error)) {
      return buildJsonResponse({ ok: false, error: error.message }, error.status);
    }

    const databaseUnavailable = isDatabaseRuntimeError(error);
    return buildJsonResponse(
      {
        ok: false,
        error: databaseUnavailable
          ? databaseUnavailableMessage
          : error instanceof Error
            ? error.message
            : "Nao foi possivel renovar a sessao do cliente."
      },
      databaseUnavailable ? 503 : 500
    );
  }
}

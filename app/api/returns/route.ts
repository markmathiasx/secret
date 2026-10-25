import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { applyNoStoreHeaders } from "@/lib/http-cache";
import { sendMail } from "@/lib/mailer";
import { getStaffNotifyEmail } from "@/lib/server-config";
import { getClientIp, escapeHtml, isValidEmail } from "@/lib/security";
import { rateLimitRequest } from "@/lib/redis";
import { logStructured } from "@/lib/logger";
import { canConnectToDatabase, prisma } from "@/lib/prisma";
import { getServerSessionUser } from "@/lib/server-session";
import {
  assertReturnEligible,
  createReturnProtocol,
  createReturnRequestKey,
  parseReturnRequestInput,
} from "@/lib/returns";

export const dynamic = "force-dynamic";

function response(body: unknown, status = 200) {
  return applyNoStoreHeaders(NextResponse.json(body, { status }));
}

export async function GET(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const rate = await rateLimitRequest(`returns:lookup:${ip}`, 20, 60 * 60 * 1000);
  if (!rate.ok) return response({ ok: false, error: "Muitas consultas. Tente novamente em instantes." }, 429);
  if (!(await canConnectToDatabase())) return response({ ok: false, error: "Pós-venda temporariamente indisponível." }, 503);

  const protocol = req.nextUrl.searchParams.get("protocol")?.trim().slice(0, 80);
  const email = req.nextUrl.searchParams.get("email")?.trim().toLowerCase().slice(0, 320);
  if (!protocol || !email || !isValidEmail(email)) {
    return response({ ok: false, error: "Informe protocolo e e-mail válidos." }, 400);
  }

  const request = await prisma.returnRequest.findFirst({
    where: { protocol, customerEmail: { equals: email, mode: "insensitive" } },
    select: { protocol: true, type: true, status: true, reason: true, requestedAt: true, updatedAt: true },
  });
  if (!request) return response({ ok: false, error: "Solicitação não encontrada." }, 404);
  return response({ ok: true, request });
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const rate = await rateLimitRequest(`returns:${ip}`, 5, 60 * 60 * 1000);
  if (!rate.ok) return response({ ok: false, error: "Muitas solicitações. Tente novamente em instantes." }, 429);
  if (!(await canConnectToDatabase())) return response({ ok: false, error: "Não foi possível registrar a solicitação agora." }, 503);

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return response({ ok: false, error: "Body inválido." }, 400);

  let input;
  try {
    input = parseReturnRequestInput(body as Record<string, unknown>);
    if (!isValidEmail(input.email)) throw new Error("E-mail inválido.");
  } catch (error) {
    return response({ ok: false, error: error instanceof Error ? error.message : "Dados inválidos." }, 400);
  }

  const user = await getServerSessionUser();
  const order = await prisma.order.findFirst({
    where: { OR: [{ orderNumber: input.orderCode }, { id: input.orderCode }] },
    select: { id: true, orderNumber: true, buyerId: true, customerEmail: true, status: true },
  });
  if (!order) return response({ ok: false, error: "Pedido não encontrado." }, 404);

  const requesterOwnsOrder = Boolean(user?.id && order.buyerId === user.id);
  const requesterEmailMatches = Boolean(order.customerEmail && order.customerEmail.toLowerCase() === input.email);
  if (!requesterOwnsOrder && !requesterEmailMatches && user?.role !== "admin") {
    return response({ ok: false, error: "Os dados informados não correspondem ao pedido." }, 403);
  }

  try {
    assertReturnEligible(order.status);
  } catch (error) {
    return response({ ok: false, error: error instanceof Error ? error.message : "Pedido inelegível." }, 409);
  }

  const requestKey = createReturnRequestKey(input, req.headers.get("idempotency-key"));
  let created;
  try {
    created = await prisma.$transaction(async (transaction) => transaction.returnRequest.create({
      data: {
        protocol: createReturnProtocol(),
        requestKey,
        orderId: order.id,
        buyerId: order.buyerId,
        type: input.type,
        customerName: input.customerName,
        customerEmail: input.email,
        reason: input.reason,
        description: input.description,
        events: {
          create: {
            type: "REQUESTED",
            actorUserId: user?.id ?? null,
            message: input.description,
            metadata: { source: "storefront", ipRateLimited: true },
          },
        },
      },
      select: { protocol: true, type: true, status: true, requestedAt: true },
    }));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      created = await prisma.returnRequest.findUnique({
        where: { requestKey },
        select: { protocol: true, type: true, status: true, requestedAt: true },
      });
    } else {
      logStructured("error", "return_request_persistence_failed", {
        orderId: order.id,
        message: error instanceof Error ? error.message : "unknown_error",
      });
      return response({ ok: false, error: "Não foi possível registrar a solicitação agora." }, 503);
    }
  }
  if (!created) return response({ ok: false, error: "Não foi possível confirmar a solicitação." }, 503);

  const safeOrder = escapeHtml(order.orderNumber);
  const safeName = escapeHtml(input.customerName);
  const safeEmail = escapeHtml(input.email);
  const safeReason = escapeHtml(input.reason);
  const safeDescription = input.description ? escapeHtml(input.description) : "";
  const safeProtocol = escapeHtml(created.protocol);
  let notificationSent = true;

  try {
    await Promise.all([
      sendMail({
        to: getStaffNotifyEmail(),
        subject: `[${safeProtocol}] Pós-venda do pedido ${safeOrder}`,
        html: `<h2>Solicitação de pós-venda</h2><p><strong>Protocolo:</strong> ${safeProtocol}</p><p><strong>Pedido:</strong> ${safeOrder}</p><p><strong>Cliente:</strong> ${safeName} (${safeEmail})</p><p><strong>Motivo:</strong> ${safeReason}</p>${safeDescription ? `<p><strong>Descrição:</strong> ${safeDescription}</p>` : ""}`,
      }),
      sendMail({
        to: input.email,
        subject: `${safeProtocol} — solicitação recebida pela MDH 3D`,
        html: `<p>Olá ${safeName}, sua solicitação do pedido <strong>${safeOrder}</strong> foi registrada.</p><p>Protocolo: <strong>${safeProtocol}</strong>.</p>`,
      }),
    ]);
  } catch (error) {
    notificationSent = false;
    logStructured("error", "return_request_notification_failed", {
      protocol: created.protocol,
      message: error instanceof Error ? error.message : "unknown_error",
    });
  }

  return response({
    ok: true,
    request: created,
    notification: notificationSent ? "sent" : "pending",
    message: notificationSent
      ? "Solicitação registrada e confirmação enviada."
      : "Solicitação registrada; a confirmação por e-mail está pendente.",
  }, 201);
}

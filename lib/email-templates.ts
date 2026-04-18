export function orderConfirmationHtml(order: {
  orderCode: string;
  customerName: string;
  productName: string;
  quantity: number;
  totalPix: number;
  paymentMethod: string;
  productionWindow: string;
}): string {
  const totalFormatted = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(order.totalPix);
  const waLink = `https://wa.me/5521920137249?text=${encodeURIComponent(`Oi! Quero acompanhar o pedido ${order.orderCode}.`)}`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Pedido recebido — MDH 3D Store</title>
</head>
<body style="margin:0;padding:0;background:#090f19;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#f1f5f9;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#090f19;padding:40px 16px;">
  <tr><td align="center">
    <table width="100%" style="max-width:560px;border-radius:24px;border:1px solid rgba(255,255,255,0.1);background:#0d1824;overflow:hidden;">
      <!-- Header -->
      <tr><td style="background:#0d1824;padding:32px 32px 20px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.08);">
        <p style="margin:0;font-size:22px;font-weight:900;letter-spacing:-0.5px;color:#22d3ee;">MDH 3D</p>
        <p style="margin:4px 0 0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.4);">Rio de Janeiro</p>
      </td></tr>

      <!-- Body -->
      <tr><td style="padding:32px;">
        <h1 style="margin:0 0 8px;font-size:26px;font-weight:900;color:#ffffff;">Pedido recebido! 📦</h1>
        <p style="margin:0 0 24px;font-size:15px;color:rgba(255,255,255,0.65);">Olá, ${order.customerName}. Seu pedido foi registrado com sucesso.</p>

        <!-- Order code box -->
        <div style="background:rgba(34,211,238,0.1);border:1px solid rgba(34,211,238,0.25);border-radius:16px;padding:16px 20px;margin-bottom:24px;text-align:center;">
          <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(34,211,238,0.7);">Código do pedido</p>
          <p style="margin:0;font-size:22px;font-weight:900;color:#22d3ee;letter-spacing:2px;">${order.orderCode}</p>
        </div>

        <!-- Details table -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
          ${[
            ["Produto", order.productName],
            ["Quantidade", String(order.quantity)],
            ["Total (Pix)", totalFormatted],
            ["Forma de pagamento", order.paymentMethod === "pix" ? "Pix" : order.paymentMethod === "cartao" ? "Cartão" : "Boleto"],
            ["Prazo de produção", order.productionWindow],
          ].map(([label, value]) => `
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.07);font-size:13px;color:rgba(255,255,255,0.5);">${label}</td>
            <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.07);font-size:13px;font-weight:600;color:#f1f5f9;text-align:right;">${value}</td>
          </tr>`).join("")}
        </table>

        <!-- Timeline -->
        <p style="margin:0 0 12px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.4);">Etapas do pedido</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
          ${[
            { step: "Pedido recebido", active: true },
            { step: "Em produção", active: false },
            { step: "Enviado", active: false },
          ].map(({ step, active }) => `
          <tr>
            <td style="padding:8px 0;">
              <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${active ? "#22d3ee" : "rgba(255,255,255,0.2)"};margin-right:10px;vertical-align:middle;"></span>
              <span style="font-size:14px;font-weight:${active ? "700" : "400"};color:${active ? "#22d3ee" : "rgba(255,255,255,0.5)"};">${step}</span>
            </td>
          </tr>`).join("")}
        </table>

        <!-- WhatsApp CTA -->
        <a href="${waLink}" style="display:block;text-align:center;background:#25D366;color:#ffffff;font-size:15px;font-weight:700;padding:14px 24px;border-radius:14px;text-decoration:none;margin-bottom:20px;">
          💬 Acompanhar pelo WhatsApp
        </a>

        <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.45);line-height:1.6;">
          Se tiver dúvidas sobre cor, prazo ou acabamento, entre em contato pelo WhatsApp usando o código do pedido acima.
        </p>
      </td></tr>

      <!-- Footer -->
      <tr><td style="background:#060c14;padding:20px 32px;text-align:center;border-top:1px solid rgba(255,255,255,0.07);">
        <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.3);">MDH 3D Store • Rio de Janeiro</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

export function paymentConfirmedHtml(order: {
  orderCode: string;
  customerName: string;
  productName: string;
  totalPix: number;
}): string {
  const totalFormatted = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(order.totalPix);
  const waLink = `https://wa.me/5521920137249?text=${encodeURIComponent(`Oi! Quero acompanhar o pedido ${order.orderCode}.`)}`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Pagamento confirmado — MDH 3D Store</title>
</head>
<body style="margin:0;padding:0;background:#090f19;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#f1f5f9;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#090f19;padding:40px 16px;">
  <tr><td align="center">
    <table width="100%" style="max-width:560px;border-radius:24px;border:1px solid rgba(255,255,255,0.1);background:#0d1824;overflow:hidden;">
      <!-- Header -->
      <tr><td style="background:#0d1824;padding:32px 32px 20px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.08);">
        <p style="margin:0;font-size:22px;font-weight:900;letter-spacing:-0.5px;color:#22d3ee;">MDH 3D</p>
        <p style="margin:4px 0 0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.4);">Rio de Janeiro</p>
      </td></tr>

      <!-- Body -->
      <tr><td style="padding:32px;">
        <!-- Green checkmark -->
        <div style="text-align:center;margin-bottom:24px;">
          <div style="display:inline-flex;align-items:center;justify-content:center;width:64px;height:64px;border-radius:50%;background:rgba(52,211,153,0.15);border:2px solid rgba(52,211,153,0.3);">
            <span style="font-size:28px;">✓</span>
          </div>
        </div>

        <h1 style="margin:0 0 8px;font-size:26px;font-weight:900;color:#ffffff;text-align:center;">Pagamento confirmado! 🎉</h1>
        <p style="margin:0 0 24px;font-size:15px;color:rgba(255,255,255,0.65);text-align:center;">Ótimo, ${order.customerName}! Seu pagamento foi aprovado e a produção começa em breve.</p>

        <!-- Order code box -->
        <div style="background:rgba(52,211,153,0.1);border:1px solid rgba(52,211,153,0.25);border-radius:16px;padding:16px 20px;margin-bottom:24px;text-align:center;">
          <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(52,211,153,0.7);">Código do pedido</p>
          <p style="margin:0;font-size:22px;font-weight:900;color:#34d399;letter-spacing:2px;">${order.orderCode}</p>
        </div>

        <!-- Details table -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
          ${[
            ["Produto", order.productName],
            ["Total pago (Pix)", totalFormatted],
            ["Status", "✅ Pagamento confirmado"],
          ].map(([label, value]) => `
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.07);font-size:13px;color:rgba(255,255,255,0.5);">${label}</td>
            <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.07);font-size:13px;font-weight:600;color:#f1f5f9;text-align:right;">${value}</td>
          </tr>`).join("")}
        </table>

        <!-- WhatsApp CTA -->
        <a href="${waLink}" style="display:block;text-align:center;background:#25D366;color:#ffffff;font-size:15px;font-weight:700;padding:14px 24px;border-radius:14px;text-decoration:none;margin-bottom:20px;">
          💬 Acompanhar pelo WhatsApp
        </a>

        <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.45);line-height:1.6;">
          Você receberá uma notificação quando o pedido for enviado. Qualquer dúvida, fale com a gente pelo WhatsApp.
        </p>
      </td></tr>

      <!-- Footer -->
      <tr><td style="background:#060c14;padding:20px 32px;text-align:center;border-top:1px solid rgba(255,255,255,0.07);">
        <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.3);">MDH 3D Store • Rio de Janeiro</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

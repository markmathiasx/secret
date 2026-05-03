import { getCachedData, cacheTtl } from './cache';

// Types
export type OrderStatus = 
  | 'confirmed'
  | 'payment_received'
  | 'in_production'
  | 'quality_check'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'completed';

export type OrderUpdate = {
  status: OrderStatus;
  message: string;
  emoji: string;
  timestamp: Date;
  estimatedCompletion?: Date;
};

export type CustomerNotification = {
  type: 'whatsapp' | 'email' | 'push';
  sentAt: Date;
  delivered: boolean;
  read?: boolean;
};

// Post-purchase notification flow
export async function startPostPurchaseFlow(orderId: string, customerData: {
  phone: string;
  email: string;
  name: string;
  postalCode: string;
}): Promise<void> {
  // Step 1: Immediate WhatsApp confirmation (< 10s)
  await sendWhatsAppConfirmation(orderId, customerData);
  
  // Step 2: Schedule production updates
  await scheduleProductionUpdates(orderId, customerData);
  
  // Step 3: Schedule NPS survey (24h after delivery)
  await scheduleNPSSurvey(orderId, customerData);
  
  // Step 4: Schedule re-engagement (D+45)
  await scheduleReEngagement(orderId, customerData);
}

// WhatsApp confirmation with order details
async function sendWhatsAppConfirmation(
  orderId: string,
  customerData: { phone: string; name: string }
): Promise<void> {
  const message = `
🎉 *Pedido Confirmado!*

Olá ${customerData.name.split(' ')[0]}, seu pedido #${orderId.slice(-6)} foi recebido!

📋 *Próximos passos:*
1️⃣ Preparando sua peça (24h)
2️⃣ Impressão 3D 🖨️
3️⃣ Controle de qualidade ✨
4️⃣ Envio com rastreio 📦

⏱️ *Prazo estimado:* 2-3 dias úteis

Acompanhe em: https://mdh3d.com.br/conta/pedidos/${orderId}

Dúvidas? Responda aqui ou ligue (21) 99999-9999
`;

  await fetch('/api/notifications/whatsapp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: customerData.phone,
      message,
      template: 'order_confirmation',
      orderId,
    }),
  });
  
  // Track notification
  await trackNotification(orderId, 'whatsapp', 'confirmation');
}

// Schedule production status updates
async function scheduleProductionUpdates(
  orderId: string,
  customerData: { phone: string; email: string }
): Promise<void> {
  const updates: { delay: number; status: OrderStatus; message: string; emoji: string }[] = [
    { delay: 24 * 60 * 60 * 1000, status: 'in_production', message: 'Sua peça entrou na impressora 3D! 🖨️', emoji: '🖨️' },
    { delay: 48 * 60 * 60 * 1000, status: 'quality_check', message: 'Passando pelo controle de qualidade ✨', emoji: '✨' },
    { delay: 72 * 60 * 60 * 1000, status: 'shipped', message: 'Sua peça foi enviada! 📦', emoji: '📦' },
  ];
  
  for (const update of updates) {
    setTimeout(async () => {
      await sendStatusUpdate(orderId, customerData, update);
    }, update.delay);
  }
}

// Send status update
async function sendStatusUpdate(
  orderId: string,
  customerData: { phone: string; email: string },
  update: { status: OrderStatus; message: string; emoji: string }
): Promise<void> {
  const message = `
${update.emoji} *Atualização do seu pedido*

${update.message}

Pedido: #${orderId.slice(-6)}
Status: ${getStatusLabel(update.status)}

Acompanhe: https://mdh3d.com.br/conta/pedidos/${orderId}
`;

  // Send WhatsApp
  await fetch('/api/notifications/whatsapp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
      to: customerData.phone,
      message,
      template: 'order_update',
      orderId,
    }),
  });
  
  // Also send email for important updates
  if (['shipped', 'delivered'].includes(update.status)) {
    await fetch('/api/notifications/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: customerData.email,
        subject: `Seu pedido foi ${getStatusLabel(update.status)}`,
        template: 'order_status_update',
        orderId,
        status: update.status,
      }),
    });
  }
  
  await trackNotification(orderId, 'whatsapp', update.status);
}

// Delivery notification with photo
export async function sendDeliveryNotification(
  orderId: string,
  customerData: { phone: string; email: string },
  deliveryPhoto?: string
): Promise<void> {
  const message = `
🎉 *Entregue!*

Sua peça foi entregue com sucesso! 📦✅

${deliveryPhoto ? '📸 Foto da entrega: ' + deliveryPhoto : ''}

Esperamos que ame seu produto 3D! 💙

⭐ *Nos avalie:*
Sua opinião ajuda muito! 
https://mdh3d.com.br/avaliar/${orderId}

Dúvidas? Estamos aqui para ajudar!
`;

  await fetch('/api/notifications/whatsapp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: customerData.phone,
      message,
      template: 'delivery_confirmation',
      orderId,
      mediaUrl: deliveryPhoto,
    }),
  });
  
  await trackNotification(orderId, 'whatsapp', 'delivered');
}

// NPS Survey (24h after delivery)
async function scheduleNPSSurvey(
  orderId: string,
  customerData: { phone: string; email: string; name: string }
): Promise<void> {
  // This would be triggered by a webhook when order is marked delivered
  // For now, we set up the structure
  const npsMessage = `
Olá ${customerData.name.split(' ')[0]}! 👋

Como foi sua experiência com a MDH 3D?

Leva só 30 segundos:
👉 https://mdh3d.com.br/nps/${orderId}

Sua opinião nos ajuda a melhorar! 💙
`;

  // Store for later trigger
  await getCachedData(
    `nps:${orderId}`,
    async () => ({
      orderId,
      scheduled: true,
      message: npsMessage,
      customerData,
    }),
    { redisTtl: cacheTtl.daily * 7 }
  );
}

// Actually send NPS (called by webhook)
export async function sendNPSSurvey(orderId: string): Promise<void> {
  interface NPSData {
    customerData: { phone: string; name: string };
    message: string;
  }

  const data = await getCachedData<NPSData | null>(
    `nps:${orderId}`,
    async () => null,
    {}
  );
  
  if (!data) return;
  
  await fetch('/api/notifications/whatsapp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: data.customerData.phone,
      message: data.message,
      template: 'nps_survey',
      orderId,
    }),
  });
  
  await trackNotification(orderId, 'whatsapp', 'nps_survey');
}

// Re-engagement campaign (D+45)
async function scheduleReEngagement(
  orderId: string,
  customerData: { phone: string; name: string }
): Promise<void> {
  const DAYS_45 = 45 * 24 * 60 * 60 * 1000;
  
  setTimeout(async () => {
    const message = `
👋 *Saudades, ${customerData.name.split(' ')[0]}!*

Vimos que faz um tempinho desde sua última compra...

🎁 Temos um presente para você:
*15% OFF* na próxima compra!

Código: *VOLTEI15*
Válido por 7 dias

Veja as novidades: https://mdh3d.com.br/catalogo?sort=new
`;

    await fetch('/api/notifications/whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: customerData.phone,
        message,
        template: 're_engagement',
        orderId,
      }),
    });
    
    await trackNotification(orderId, 'whatsapp', 're_engagement');
  }, DAYS_45);
}

// Review request with photo incentive
export async function sendReviewRequest(
  orderId: string,
  customerData: { phone: string; name: string },
  productName: string
): Promise<void> {
  const message = `
📸 *Que tal uma foto?*

Oi ${customerData.name.split(' ')[0]}! 

Como está seu/sua ${productName}?

🎁 *Ganhe 10% OFF* enviando uma foto:
→ https://mdh3d.com.br/review/${orderId}

Sua foto pode aparecer no nosso feed! 📱

Agradecemos muito seu apoio 💙
`;

  await fetch('/api/notifications/whatsapp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: customerData.phone,
      message,
      template: 'review_request',
      orderId,
    }),
  });
}

// Tracking link generator
export function generateTrackingLink(
  carrier: 'correios' | 'jadlog' | 'azul',
  trackingCode: string
): string {
  const links: Record<string, string> = {
    correios: `https://rastreamento.correios.com.br/app/index.php`,
    jadlog: `https://www.jadlog.com.br/siteInstitucional/tracking/tracking`,
    azul: `https://www.azulcargo.com.br/rastreamento/`,
  };
  
  return links[carrier] || links.correios;
}

// Status labels
function getStatusLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    confirmed: 'Confirmado',
    payment_received: 'Pagamento Recebido',
    in_production: 'Em Produção',
    quality_check: 'Controle de Qualidade',
    shipped: 'Enviado',
    out_for_delivery: 'Saiu para Entrega',
    delivered: 'Entregue',
    completed: 'Concluído',
  };
  
  return labels[status] || status;
}

// Notification tracking
async function trackNotification(
  orderId: string,
  channel: 'whatsapp' | 'email' | 'push',
  type: string
): Promise<void> {
  await fetch('/api/analytics/track-notification', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId,
      channel,
      type,
      timestamp: new Date().toISOString(),
    }),
  }).catch(() => {});
}

// Abandoned cart recovery (30 min after abandonment)
export async function sendAbandonedCartRecovery(
  sessionId: string,
  customerData: { phone?: string; email?: string; name?: string },
  cartItems: { name: string; price: number; image?: string }[]
): Promise<void> {
  if (!customerData.phone) return;
  
  const total = cartItems.reduce((sum, item) => sum + item.price, 0);
  const itemList = cartItems.slice(0, 3).map(i => i.name).join(', ');
  
  const message = `
🛒 *Esqueceu algo?*

Oi${customerData.name ? ' ' + customerData.name.split(' ')[0] : ''}!

Vimos que você deixou itens no carrinho:
• ${itemList}${cartItems.length > 3 ? ` (+${cartItems.length - 3})` : ''}

💰 Total: R$ ${total.toFixed(2)}

🎁 *Frete grátis* para finalizar agora!

Complete sua compra:
👉 https://mdh3d.com.br/checkout?recover=${sessionId}

Precisa de ajuda? Só chamar! 💙
`;

  await fetch('/api/notifications/whatsapp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: customerData.phone,
      message,
      template: 'abandoned_cart',
      sessionId,
    }),
  });
}

// Browse abandonment (if viewed but no cart after 2 hours)
export async function sendBrowseAbandonment(
  sessionId: string,
  customerData: { phone?: string; email?: string },
  viewedProducts: { name: string; slug: string }[]
): Promise<void> {
  if (!customerData.phone || viewedProducts.length === 0) return;
  
  const product = viewedProducts[0];
  
  const message = `
👀 *Interessante escolha!*

Vimos que você estava olhando:
• ${product.name}

Ainda está disponível! 🎁

Quer saber mais ou tem alguma dúvida?
Estamos aqui para ajudar! 💙

Ver produto: https://mdh3d.com.br/catalogo/${product.slug}
`;

  await fetch('/api/notifications/whatsapp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: customerData.phone,
      message,
      template: 'browse_abandonment',
      sessionId,
    }),
  });
}

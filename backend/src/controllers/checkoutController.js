const paymentService = require('../services/paymentService');

async function createCheckout(req, res, next) {
  try {
    const { gift_id, coupon_code } = req.body;

    if (!gift_id) {
      return res.status(400).json({ error: 'gift_id é obrigatório.' });
    }

    const gift = await global.prisma.gift.findUnique({ where: { id: gift_id } });
    if (!gift) {
      return res.status(404).json({ error: 'Gift não encontrado.' });
    }

    if (gift.is_paid) {
      return res.status(400).json({
        error: 'Este gift já foi pago.',
        quest_url: `${process.env.FRONTEND_URL}/quest/${gift.unique_hash}`,
      });
    }

    let unitPrice = parseInt(process.env.GIFT_PRICE || '990', 10) / 100;
    let appliedCouponId = null;

    if (coupon_code) {
      const code = coupon_code.trim().toUpperCase();
      const coupon = await global.prisma.coupon.findUnique({ where: { code } });

      if (!coupon || !coupon.is_active || (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit)) {
        return res.status(400).json({ error: 'Cupom inválido ou expirado.' });
      }

      if (coupon.discount_type === 'fixed') {
        unitPrice -= coupon.discount_value;
      } else if (coupon.discount_type === 'percentage') {
        unitPrice -= unitPrice * (coupon.discount_value / 100);
      }

      // Minimum price rule (e.g. MercadoPago limitation or business rule)
      unitPrice = Math.max(0.01, unitPrice);

      // Increment coupon usage and save to gift within a transaction
      await global.prisma.$transaction([
        global.prisma.coupon.update({
          where: { id: coupon.id },
          data: { used_count: { increment: 1 } },
        }),
        global.prisma.gift.update({
          where: { id: gift.id },
          data: { coupon_id: coupon.id },
        })
      ]);

      appliedCouponId = coupon.id;
    }

    const { checkoutUrl, sandboxUrl, preferenceId } = await paymentService.createPaymentPreference({
      giftId: gift.id,
      playerName: gift.player1_name,
      giftHash: gift.unique_hash,
      unitPrice: Number(unitPrice.toFixed(2)),
    });
    
    return res.status(200).json({
      checkout_url: checkoutUrl,
      preference_id: preferenceId,
      message: '💳 Link de pagamento gerado com sucesso!',
    });
  } catch (error) {
    next(error);
  }
}

const crypto = require('crypto');

function validateWebhookSignature(req) {
  const signature = req.headers['x-signature'] || req.headers['x-mpt-signature'];
  const requestId = req.headers['x-request-id'] || '';
  const webhookSecret = process.env.WEBHOOK_SECRET;
  
  if (!signature || !webhookSecret) return false;
  
  const parts = signature.split(',');
  let ts, hash;
  
  parts.forEach(part => {
    const [key, value] = part.split('=');
    if (key === 'ts') ts = value;
    if (key === 'v1') hash = value;
  });

  if (!ts || !hash) return false;

  const dataId = req.body?.data?.id || '';
  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const hmac = crypto.createHmac('sha256', webhookSecret);
  hmac.update(manifest);
  const computedHash = hmac.digest('hex');

  return computedHash === hash;
}

async function handleWebhook(req, res, next) {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'Payload vazio.' });
    }

    if (!process.env.WEBHOOK_SECRET) {
      console.error('🚨 ERRO CRÍTICO: WEBHOOK_SECRET não está definido no ambiente de produção!');
      return res.status(500).json({ error: 'Configuração do servidor inválida.' });
    }

    if (!validateWebhookSignature(req)) {
      console.warn('⚠️ Webhook signature validation failed!');
      return res.status(403).json({ error: 'Assinatura inválida.' });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    const { type, data } = body;

    if (type !== 'payment') {
      return res.status(200).json({ received: true });
    }

    const paymentId = data?.id;
    if (!paymentId || isNaN(Number(paymentId))) {
      return res.status(400).json({ error: 'Payment ID inválido ou ausente no webhook.' });
    }

    const paymentData = await paymentService.getPayment(paymentId);

    const { status, external_reference: giftId } = paymentData;

    if (status === 'approved' && giftId) {
      await global.prisma.gift.update({
        where: { id: giftId },
        data: {
          is_paid: true,
          payment_id: String(paymentId),
        },
      });

      console.log(`✅ Gift ${giftId} desbloqueado! Payment ID: ${paymentId}`);
    }

    // Always return 200 to acknowledge the webhook
    return res.status(200).json({ received: true });
  } catch (error) {
    // Still return 200 to prevent MercadoPago retries on our internal errors
    console.error('Webhook error:', error);
    return res.status(200).json({ received: true, error: error.message });
  }
}

module.exports = { createCheckout, handleWebhook };

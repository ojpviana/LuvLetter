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
  try {
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

    // Tentar extrair do body ou da query string
    let dataId = req.query?.['data.id'] || req.query?.id || '';
    
    if (!dataId && req.body) {
      if (Buffer.isBuffer(req.body)) {
        try {
          const parsed = JSON.parse(req.body.toString('utf8'));
          dataId = parsed?.data?.id || '';
        } catch(e){}
      } else {
        dataId = req.body?.data?.id || '';
      }
    }

    const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
    const hmac = crypto.createHmac('sha256', webhookSecret);
    hmac.update(manifest);
    const computedHash = hmac.digest('hex');

    return computedHash === hash;
  } catch (e) {
    console.error('Error in signature validation:', e);
    return false;
  }
}

async function handleWebhook(req, res, next) {
  try {
    console.log('--- RECEBIDO WEBHOOK MERCADO PAGO ---');
    console.log('Query:', req.query);
    
    // Tratamento robusto do Body (Raw/Buffer ou Object)
    let bodyObj = {};
    if (req.body) {
      if (Buffer.isBuffer(req.body)) {
        try { bodyObj = JSON.parse(req.body.toString('utf8')); } catch(e){}
      } else if (typeof req.body === 'string') {
        try { bodyObj = JSON.parse(req.body); } catch(e){}
      } else {
        bodyObj = req.body;
      }
    }
    console.log('Body extraído:', JSON.stringify(bodyObj).substring(0, 200));

    if (!process.env.WEBHOOK_SECRET) {
      console.error('🚨 ERRO CRÍTICO: WEBHOOK_SECRET não está definido.');
      return res.status(200).send('OK'); // Always return 200 to MP
    }

    if (!validateWebhookSignature(req)) {
      console.warn('⚠️ Webhook signature validation failed! Verifique se a secret está correta.');
      // Opcionalmente retornar 403, mas 200 impede retries infinitos no MP se a secret mudou
      return res.status(200).send('Signature invalid'); 
    }

    const type = bodyObj?.type || bodyObj?.action || req.query?.type || req.query?.topic;
    if (type !== 'payment' && type !== 'payment.created' && type !== 'payment.updated') {
      console.log(`Ignorando evento do tipo: ${type}`);
      return res.status(200).send('OK');
    }

    const paymentId = bodyObj?.data?.id || req.query?.['data.id'] || req.query?.id;
    if (!paymentId || isNaN(Number(paymentId))) {
      console.warn('⚠️ Payment ID ausente ou inválido no payload.');
      return res.status(200).send('OK');
    }

    console.log(`Processando pagamento ID: ${paymentId}`);
    
    try {
      const paymentData = await paymentService.getPayment(paymentId);
      const { status, external_reference: giftId } = paymentData;

      console.log(`Status do MP: ${status} | Gift ID: ${giftId}`);

      if (status === 'approved' && giftId) {
        await global.prisma.gift.update({
          where: { id: giftId },
          data: {
            is_paid: true,
            payment_id: String(paymentId),
          },
        });
        console.log(`✅ Gift ${giftId} marcado como PAGO com sucesso!`);
      }
    } catch (apiError) {
      console.error(`Falha ao buscar detalhes do pagamento ${paymentId} na API do MP:`, apiError.message);
      // Se a API do MP falhar (ex: rate limit), retornamos 500 para eles tentarem de novo depois
      return res.status(500).json({ error: 'Erro temporário ao consultar API do MP' });
    }

    return res.status(200).send('OK');
  } catch (error) {
    console.error('🚨 ERRO FATAL NO WEBHOOK:', error);
    // Para evitar 502 na Vercel (crash), capturamos tudo.
    // Retornamos 500 para que o MP tente reenviar o evento mais tarde se foi erro de banco
    return res.status(500).send('Internal Server Error');
  }
}

module.exports = { createCheckout, handleWebhook };

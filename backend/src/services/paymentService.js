const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');

const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
  options: { timeout: 5000 },
});

const preference = new Preference(mpClient);
const payment = new Payment(mpClient);

async function createPaymentPreference({ giftId, playerName, giftHash, unitPrice }) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    const preferenceData = {
      items: [
        {
          id: giftId,
          title: 'LuvLetter - Cartas de Amor Geradas por IA',
          description: 'Desbloqueie a carta de amor gerada por IA + galeria de fotos para sua pessoa especial.',
          category_id: 'digital_goods',
          quantity: 1,
          unit_price: unitPrice,
          currency_id: 'BRL',
        },
      ],
      payer: {
        name: playerName,
      },
      back_urls: {
        success: `${frontendUrl}/quest/${giftHash}`,
        failure: `${frontendUrl}/checkout/${giftId}?payment=failed`,
        pending: `${frontendUrl}/checkout/${giftId}?payment=pending`,
      },
      ...(frontendUrl.startsWith('https') ? { auto_return: 'approved' } : {}),
      notification_url: `${process.env.APP_URL}/api/webhook`,
      external_reference: giftId,
      payment_methods: {
        excluded_payment_types: [],
        installments: 1,
      },
      expires: true,
      expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    console.log('Sending to MercadoPago:', JSON.stringify(preferenceData, null, 2));

    const response = await preference.create({ body: preferenceData });

  return {
    checkoutUrl: response.init_point,
    sandboxUrl: response.sandbox_init_point,
    preferenceId: response.id,
  };
}

async function getPayment(paymentId) {
  return payment.get({ id: paymentId });
}

module.exports = { createPaymentPreference, getPayment };

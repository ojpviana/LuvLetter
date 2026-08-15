async function validateCoupon(req, res, next) {
  try {
    const { code } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Código do cupom é obrigatório.' });
    }

    const couponCode = code.trim().toUpperCase();

    const coupon = await global.prisma.coupon.findUnique({
      where: { code: couponCode },
    });

    if (!coupon) {
      return res.status(404).json({ error: 'Cupom inválido ou não encontrado.' });
    }

    if (!coupon.is_active) {
      return res.status(400).json({ error: 'Este cupom não está mais ativo.' });
    }

    if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) {
      return res.status(400).json({ error: 'Este cupom atingiu o limite de uso.' });
    }

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');

    return res.status(200).json({
      message: 'Cupom válido.',
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { validateCoupon };

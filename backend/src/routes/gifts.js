const express = require('express');
const router = express.Router();
const multer = require('multer');
const { rateLimit } = require('express-rate-limit');
const giftController = require('../controllers/giftController');

const generateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Muitas tentativas de geração, tente novamente mais tarde.' },
});

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Limite de upload excedido, tente novamente mais tarde.' },
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 6,
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não suportado. Use JPEG, PNG, WebP ou GIF.'));
    }
  },
});

router.post('/', giftController.createGift);

router.post(
  '/:id/upload',
  uploadLimiter,
  upload.array('photos', 6),
  giftController.uploadPhotos
);

router.post('/:id/generate', generateLimiter, giftController.generateLetter);

router.get('/:id/preview', giftController.previewGift);

router.get('/:id/review', giftController.getReview);

router.post('/:id/regenerate', generateLimiter, giftController.regenerateLetter);

router.post('/:id/finalize', giftController.finalizeGift);

module.exports = router;

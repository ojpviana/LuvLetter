const express = require('express');
const router = express.Router();
const multer = require('multer');
const { rateLimit } = require('express-rate-limit');
const giftController = require('../controllers/giftController');

// Rate limiters
const generateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 AI generation requests per 15min to prevent abuse
  message: { error: 'Muitas tentativas de geração, tente novamente mais tarde.' },
});

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 upload requests per windowMs
  message: { error: 'Limite de upload excedido, tente novamente mais tarde.' },
});

// Multer config: use memory storage, then service uploads to R2
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
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

// POST /api/gifts — Create a new gift
router.post('/', giftController.createGift);

// POST /api/gifts/:id/upload — Upload up to 6 photos
router.post(
  '/:id/upload',
  uploadLimiter,
  upload.array('photos', 6),
  giftController.uploadPhotos
);

// POST /api/gifts/:id/generate — Generate letter with Groq AI
router.post('/:id/generate', generateLimiter, giftController.generateLetter);

// GET /api/gifts/:id/preview — Preview data (blurred letter if not paid)
router.get('/:id/preview', giftController.previewGift);

// GET /api/gifts/:id/review — Director's Cut review screen data (post-payment)
router.get('/:id/review', giftController.getReview);


// POST /api/gifts/:id/regenerate — Regenerate letter with Groq AI (Director's Cut)
router.post('/:id/regenerate', generateLimiter, giftController.regenerateLetter);

// POST /api/gifts/:id/finalize — Finalize and seal the gift (Director's Cut)
router.post('/:id/finalize', giftController.finalizeGift);

module.exports = router;

const { nanoid } = require('nanoid');
const groqService = require('../services/groqService');
const storageService = require('../services/storageService');

function parseLetter(letterString) {
  if (!letterString) return null;
  try {
    return JSON.parse(letterString);
  } catch(e) {
    return { titulo: "", introducao: "", corpo_principal: letterString, fechamento: "" };
  }
}

/**
 * POST /api/gifts
 * Creates a new gift with player info. Returns the gift ID.
 */
async function createGift(req, res, next) {
  try {
    const { player1_name, player2_name, time_together, traits, couple_style, interests } = req.body;

    // Validate required fields
    if (!player1_name || !player2_name || !time_together || !traits || !couple_style) {
      return res.status(400).json({
        error: 'Todos os campos são obrigatórios: player1_name, player2_name, time_together, traits, couple_style.',
      });
    }

    // Security: Length validations to prevent payload abuse
    if (player1_name.length > 50 || player2_name.length > 50) {
      return res.status(400).json({ error: 'Nomes devem ter no máximo 50 caracteres.' });
    }
    if (time_together.length > 50 || couple_style.length > 50) {
      return res.status(400).json({ error: 'Campos de tempo e estilo excederam o limite de caracteres.' });
    }
    if (traits.length > 1000) {
      return res.status(400).json({ error: 'O campo de características deve ter no máximo 1000 caracteres.' });
    }
    if (interests && interests.length > 300) {
      return res.status(400).json({ error: 'O campo de interesses excedeu o limite.' });
    }

    const unique_hash = nanoid(10); // Short unique URL-friendly hash

    const gift = await global.prisma.gift.create({
      data: {
        player1_name: player1_name.trim(),
        player2_name: player2_name.trim(),
        time_together: time_together.trim(),
        traits: traits.trim(),
        couple_style: couple_style.trim(),
        interests: interests ? interests.trim() : null,
        unique_hash,
      },
    });

    return res.status(201).json({
      id: gift.id,
      unique_hash: gift.unique_hash,
      message: '🎮 Quest iniciada! Gift criado com sucesso.',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/gifts/:id/upload
 * Handles multipart upload of up to 6 photos via Multer.
 * Stores URLs in the Photo table.
 */
async function uploadPhotos(req, res, next) {
  try {
    const { id } = req.params;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'Nenhuma foto enviada.' });
    }

    if (files.length > 6) {
      return res.status(400).json({ error: 'Máximo de 6 fotos permitidas.' });
    }

    // Verify gift exists
    const gift = await global.prisma.gift.findUnique({ where: { id } });
    if (!gift) {
      return res.status(404).json({ error: 'Gift não encontrado.' });
    }

    // Upload all files to R2 in parallel
    const urls = await storageService.uploadMultipleFiles(files, id);

    // Save photo URLs to database
    const photos = await global.prisma.$transaction(
      urls.map((url) =>
        global.prisma.photo.create({
          data: {
            gift_id: id,
            image_url: url,
          },
        })
      )
    );

    return res.status(201).json({
      message: `📸 ${photos.length} foto(s) enviada(s) com sucesso!`,
      photos: photos.map((p) => ({ id: p.id, url: p.image_url })),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/gifts/:id/generate
 * Calls Groq Llama 3 to generate the love letter and saves it.
 */
async function generateLetter(req, res, next) {
  try {
    const { id } = req.params;

    const gift = await global.prisma.gift.findUnique({ where: { id } });
    if (!gift) {
      return res.status(404).json({ error: 'Gift não encontrado.' });
    }

    // Generate with Groq
    const letter = await groqService.generateLetter({
      traits: gift.traits,
      player1Name: gift.player1_name,
      player2Name: gift.player2_name,
      timeTogether: gift.time_together,
      coupleStyle: gift.couple_style,
      interests: gift.interests,
    });

    // Save to database
    const updatedGift = await global.prisma.gift.update({
      where: { id },
      data: { generated_letter: letter },
    });

    return res.status(200).json({
      message: '✨ Carta gerada pelo bardo com sucesso!',
      letter: parseLetter(updatedGift.generated_letter),
    });
  } catch (error) {
    // Specific Groq error handling
    if (error.message?.includes('bardo')) {
      return res.status(503).json({ error: error.message });
    }
    next(error);
  }
}

/**
 * GET /api/gifts/:id/review
 * Returns gift data for the Director's Cut review screen.
 * Only accessible after payment (is_paid === true).
 */
async function getReview(req, res, next) {
  try {
    const { id } = req.params;

    const gift = await global.prisma.gift.findUnique({
      where: { id },
      include: { photos: true },
    });

    if (!gift) {
      return res.status(404).json({ error: 'Gift não encontrado.' });
    }

    if (!gift.is_paid) {
      return res.status(403).json({
        error: 'Acesso negado. O pagamento não foi confirmado.',
      });
    }

    return res.status(200).json({
      id: gift.id,
      player1_name: gift.player1_name,
      player2_name: gift.player2_name,
      generated_letter: parseLetter(gift.generated_letter),
      is_finalized: gift.is_finalized,
      unique_hash: gift.unique_hash,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/gifts/:id/regenerate
 * Calls Groq again using the same stored data to produce a new letter variation.
 * Replaces the current generated_letter in the database.
 */
async function regenerateLetter(req, res, next) {
  try {
    const { id } = req.params;

    const gift = await global.prisma.gift.findUnique({ where: { id } });
    if (!gift) {
      return res.status(404).json({ error: 'Gift não encontrado.' });
    }

    if (!gift.is_paid) {
      return res.status(403).json({ error: 'Acesso negado. Pagamento não confirmado.' });
    }

    if (gift.is_finalized) {
      return res.status(400).json({ error: 'Este presente já foi lacrado e não pode ser regenerado.' });
    }

    // Call Groq with same stored parameters
    const letter = await groqService.generateLetter({
      traits: gift.traits,
      player1Name: gift.player1_name,
      player2Name: gift.player2_name,
      timeTogether: gift.time_together,
      coupleStyle: gift.couple_style,
      interests: gift.interests,
    });

    const updatedGift = await global.prisma.gift.update({
      where: { id },
      data: { generated_letter: letter },
    });

    return res.status(200).json({
      message: '✨ Nova versão da carta gerada com sucesso!',
      letter: parseLetter(updatedGift.generated_letter),
    });
  } catch (error) {
    if (error.message?.includes('bardo')) {
      return res.status(503).json({ error: error.message });
    }
    next(error);
  }
}

/**
 * POST /api/gifts/:id/finalize
 * Receives { final_text } in the body.
 * Saves the final letter, marks is_finalized = true, and returns the public hash.
 */
async function finalizeGift(req, res, next) {
  try {
    const { id } = req.params;
    const { final_text } = req.body;

    if (!final_text) {
      return res.status(400).json({ error: 'O texto final (final_text) é obrigatório.' });
    }

    const gift = await global.prisma.gift.findUnique({ where: { id } });
    if (!gift) {
      return res.status(404).json({ error: 'Gift não encontrado.' });
    }

    if (!gift.is_paid) {
      return res.status(403).json({ error: 'Acesso negado. Pagamento não confirmado.' });
    }

    const updatedGift = await global.prisma.gift.update({
      where: { id },
      data: {
        generated_letter: typeof final_text === 'string' ? final_text.trim() : JSON.stringify(final_text),
        is_finalized: true,
      },
    });

    console.log(`🔒 Gift ${id} lacrado! Hash público: ${updatedGift.unique_hash}`);

    return res.status(200).json({
      message: '🎁 Presente lacrado com sucesso!',
      unique_hash: updatedGift.unique_hash,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/gifts/:id/preview
 * Returns gift data for the checkout preview.
 * Masks (blurs) the letter if not yet paid — only sends partial text.
 */
async function previewGift(req, res, next) {
  try {
    const { id } = req.params;

    const gift = await global.prisma.gift.findUnique({
      where: { id },
      include: { photos: true },
    });

    if (!gift) {
      return res.status(404).json({ error: 'Gift não encontrado.' });
    }

    let parsedLetter = parseLetter(gift.generated_letter);
    if (!gift.is_paid && parsedLetter) {
      if (parsedLetter.corpo_principal) {
        parsedLetter.corpo_principal = parsedLetter.corpo_principal.replace(/[^\s\n.,!?]/g, 'x');
      }
      if (parsedLetter.fechamento) {
        parsedLetter.fechamento = parsedLetter.fechamento.replace(/[^\s\n.,!?]/g, 'x');
      }
    }

    // Return full data but mask the letter if not paid
    const responseData = {
      id: gift.id,
      player1_name: gift.player1_name,
      player2_name: gift.player2_name,
      time_together: gift.time_together,
      is_paid: gift.is_paid,
      unique_hash: gift.unique_hash,
      photos: gift.photos.map((p) => ({ id: p.id, url: p.image_url })),
      generated_letter: parsedLetter,
      letter_blurred: !gift.is_paid,
    };

    return res.status(200).json(responseData);
  } catch (error) {
    next(error);
  }
}

module.exports = { createGift, uploadPhotos, generateLetter, previewGift, getReview, regenerateLetter, finalizeGift };

const groqService = require('../services/groqService');

function parseLetter(letterString) {
  if (!letterString) return null;
  try {
    return JSON.parse(letterString);
  } catch(e) {
    return { titulo: "", introducao: "", corpo_principal: letterString, fechamento: "" };
  }
}

/**
 * GET /api/quest/:hash
 * Public endpoint. Returns the full gift ONLY if is_paid is true.
 * If generated_letter is missing, auto-generates it on the spot.
 */
async function getQuest(req, res, next) {
  try {
    const { hash } = req.params;

    const gift = await global.prisma.gift.findUnique({
      where: { unique_hash: hash },
      include: { photos: true },
    });

    if (!gift) {
      return res.status(404).json({
        error: '🗺️ Quest não encontrada. Verifique o link recebido.',
      });
    }

    if (!gift.is_paid) {
      return res.status(403).json({
        error: '🔒 Esta quest ainda não foi desbloqueada. O pagamento precisa ser confirmado.',
        hint: 'Se você acabou de pagar, aguarde alguns instantes e tente novamente.',
      });
    }

    if (!gift.is_finalized) {
      return res.status(403).json({
        error: '⏳ Este presente ainda está sendo preparado pelo remetente.',
        hint: 'Aguarde o remetente finalizar a revisão da carta.',
      });
    }


    // ── Auto-geração da carta se ausente ──────────────────────────────────────
    // Acontece quando o usuário pulou a etapa de fotos sem gerar a carta.
    let letter = gift.generated_letter;

    if (!letter || !letter.trim()) {
      console.log(`✍️  [Quest] Carta ausente para gift ${gift.id} — gerando agora...`);
      try {
        letter = await groqService.generateLetter({
          traits:       gift.traits,
          player1Name:  gift.player1_name,
          player2Name:  gift.player2_name,
          timeTogether: gift.time_together,
          coupleStyle:  gift.couple_style,
          interests:    gift.interests,
        });

        // Salva no banco para não gerar de novo na próxima visita
        await global.prisma.gift.update({
          where: { id: gift.id },
          data: { generated_letter: letter },
        });

        console.log(`✅ [Quest] Carta gerada e salva para gift ${gift.id}.`);
      } catch (genError) {
        console.error('❌ [Quest] Falha ao auto-gerar carta:', genError.message);
        letter = null; // retorna null, frontend mostra mensagem de fallback
      }
    }

    return res.status(200).json({
      id: gift.id,
      player1_name: gift.player1_name,
      player2_name: gift.player2_name,
      time_together: gift.time_together,
      generated_letter: parseLetter(letter),
      photos: gift.photos.map((p) => ({ id: p.id, url: p.image_url })),
      created_at: gift.created_at,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getQuest };

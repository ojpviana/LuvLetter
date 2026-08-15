const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const SYSTEM_PROMPT = `Você é um ghostwriter especializado em cartas de amor modernas e informais.

RETORNE APENAS O SEGUINTE OBJETO JSON (sem markdown, sem texto extra):
{
  "titulo": "Título curto e carinhoso (máx 5 palavras)",
  "introducao": "Máximo ABSOLUTO de 3 frases.",
  "corpo_principal": "Máximo ABSOLUTO de 2 parágrafos curtos.",
  "fechamento": "Máximo ABSOLUTO de 2 frases."
}

REGRAS INVIOLAVEIS:
- Escreva em português do Brasil coloquial. ZERO formalidade.
- PROIBIDO usar: jornada, laços, farol, alma, universo, chama, destino.
- REGRA DE OURO: NUNCA invente fatos, cenários ou memórias. Se o usuário forneceu poucos detalhes (ex: 'gosta de videogame e memes'), expanda os SENTIMENTOS e a CONEXÃO baseados nisso, mas NÃO invente qual é o jogo ou qual é o meme. Seja romântico, literal e contido.`;

async function generateLetter({ traits, player1Name, player2Name, timeTogether, coupleStyle, interests }) {
  const userPrompt = `
Escreva uma mensagem de ${player1Name} para ${player2Name}.
Tempo de relacionamento: ${timeTogether}.
Estilo do casal: ${coupleStyle}.
${interests ? `Interesses em comum: ${interests}.` : ''}
Contexto fornecido: ${traits || 'Foque no carinho da convivência diária.'}.

IMPORTANTE: Desenvolva o texto para dar volume e emoção à carta${interests ? ', focando em como é bom compartilhar esses interesses hoje' : ''}. Não invente histórias ou cenários do passado que não estão no contexto. Responda EXCLUSIVAMENTE com o objeto JSON puro e nada mais.
  `.trim();

  const completion = await groq.chat.completions.create({
    model: 'openai/gpt-oss-120b',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.40,
    max_tokens: 2500,
    presence_penalty: 0.5,
    response_format: { type: 'json_object' },
  });

  const letter = completion.choices[0]?.message?.content;

  if (!letter) {
    throw new Error('O bardo falhou em compor a carta. Tente novamente.');
  }

  return letter.trim();
}

module.exports = { generateLetter };
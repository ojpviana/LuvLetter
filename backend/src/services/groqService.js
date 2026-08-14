const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const SYSTEM_PROMPT = `Você é um ghostwriter especializado em cartas de amor modernas, informais e envolventes.

SUA MISSÃO E FORMATO OBRIGATÓRIO:
Você DEVE retornar a resposta ESTRITAMENTE em formato JSON. O objeto JSON deve conter exatamente as seguintes 4 chaves:
1. "titulo": Título curto e carinhoso (max 5 palavras).
2. "introducao": O "aperitivo" da carta. Cativante e real.
3. "corpo_principal": O recheio emocional da carta. Desenvolva os sentimentos sem inventar fatos.
4. "fechamento": Uma despedida carinhosa.

[REGRAS ABSOLUTAS DE ESTILO E VERACIDADE - SOB PENA DE FALHA]:
1. ZERO FORMALIDADE. Escreva em português do Brasil coloquial do dia a dia.
2. SEM CLICHÊS. Proibido usar: jornada, laços, farol, alma, universo, chama, destino.
3. REGRA DE OURO PARA INTERESSES: NUNCA invente locais, eventos passados ou memórias específicas que não foram fornecidas. Trate os interesses informados como gostos atuais e atemporais do casal. 
   - EXEMPLO RUIM (Invenção): "Lembra quando fomos ao parque ver o pôr do sol com vinho?"
   - EXEMPLO BOM (Atemporal): "Não tem nada melhor do que dividir um vinho com você e curtir o pôr do sol."
4. EXPANSÃO SEGURA: Você pode (e deve) detalhar os sentimentos, a cumplicidade e o quanto é bom estar junto, mas os FATOS (onde, quando, eventos) devem se restringir ESTRITAMENTE ao que o usuário enviou.
5. ORTOGRAFIA E CONCORDÂNCIA: É OBRIGATÓRIO revisar a gramática. Preste muita atenção na concordância verbal e nominal (ex: O certo é "a gente se diverte juntos" ao invés do errado "a gente se divertir juntos"). O texto deve ser impecável em português.`;

async function generateLetter({ traits, player1Name, player2Name, timeTogether, coupleStyle, interests }) {
  const userPrompt = `
Escreva uma mensagem de ${player1Name} para ${player2Name}.
Tempo de relacionamento: ${timeTogether}.
Estilo do casal: ${coupleStyle}.
${interests ? `Interesses em comum: ${interests}.` : ''}
Contexto fornecido: ${traits || 'Foque no carinho da convivência diária.'}.

IMPORTANTE: Desenvolva o texto para dar volume e emoção à carta, focando em como é bom compartilhar esses interesses hoje. Não invente histórias ou cenários do passado que não estão no contexto. Responda APENAS com o objeto JSON.
  `.trim();

  const completion = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.70, // Reduzido para evitar invenção de cenários, mantendo a fluidez
    max_tokens: 1200,
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
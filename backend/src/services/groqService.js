const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const SYSTEM_PROMPT = `Você é um ghostwriter especializado em cartas de amor modernas e informais.

RETORNE APENAS O SEGUINTE OBJETO JSON (sem markdown, sem texto extra):
{
  "titulo": "Título curto e carinhoso (máx 5 palavras)",
  "introducao": "Parágrafo inicial com 3-4 frases construindo o clima da carta",
  "corpo_principal": "2-3 parágrafos aprofundando os sentimentos e o impacto da pessoa na vida de quem envia",
  "fechamento": "Despedida carinhosa e informal"
}

REGRAS INVIOLAVEIS:
- Escreva em português do Brasil coloquial. ZERO formalidade.
- PROIBIDO usar: jornada, laços, farol, alma, universo, chama, destino.
- PROIBIDO inventar fatos, viagens, nomes de pets, lugares ou eventos que o usuário não informou.
- Se os interesses estiverem vazios, não invente atividades cotidianas. Foque em sentimentos, a paz que a pessoa traz e promessas para o futuro.
- Se os interesses estiverem preenchidos, trate-os como gostos atuais atemporais. Não invente memórias com eles.
- Total da carta: 300 a 400 palavras distribuídas entre os 4 campos.`;

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
    temperature: 0.70, // Reduzido para evitar invenção de cenários, mantendo a fluidez
    max_tokens: 4000,
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
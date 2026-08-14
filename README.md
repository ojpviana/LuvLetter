# 💌 LuvLetter

**LuvLetter** é um SaaS inovador que transforma histórias de amor reais em presentes digitais premium, mesclando Inteligência Artificial Generativa e um design nostálgico em Pixel Art / 8-bit.

A plataforma permite que casais eternizem seus momentos através de uma "Experiência Surpresa" interativa: um baú digital que, ao ser desbloqueado, revela uma carta de amor personalizada e uma galeria fotográfica, embaladas por uma trilha sonora chiptune original.

---

## 🎯 Nossa Proposta de Valor

1. **Hiper-Personalização:** Cartas geradas por IA a partir de detalhes reais do casal (traços de personalidade, tempo juntos e interesses).
2. **Design Afetivo:** Uma interface que foge do óbvio, usando nostalgia e gamificação para criar engajamento emocional.
3. **Monetização Simples:** Funil de vendas otimizado com preview dinâmico (efeito blur) e conversão via micro-transação com pagamento instantâneo.

---

## 🛠️ Stack Tecnológica

Nossa arquitetura foi desenhada focando em alta performance, baixo custo de manutenção e escalabilidade serverless:

* **Frontend:** React 18 + Vite + Tailwind CSS
* **Backend:** Node.js (Express Serverless API)
* **Banco de Dados:** PostgreSQL (hospedado via Supabase) + Prisma ORM
* **IA Generativa:** API Groq (LLM para geração ultrarrápida de texto)
* **Storage de Imagens:** Cloudflare R2 (Alta disponibilidade e custo zero de egress)
* **Pagamentos:** Integração nativa com MercadoPago API + Webhooks seguros
* **Infraestrutura / Deploy:** Vercel (Arquitetura Monolítica hospedando frontend e backend no mesmo domínio)

---

## 🚀 Como Funciona o Funil de Vendas

1. **Onboarding:** O Remetente acessa a plataforma e preenche o briefing detalhado do relacionamento (características, tempo juntos, estilo).
2. **Upload Seguros:** O Remetente envia as fotos marcantes do casal diretamente para a nuvem (Cloudflare R2).
3. **Draft & Revisão (IA):** O sistema gera automaticamente um rascunho premium da carta de amor. O Remetente pode revisar, pedir para a IA reescrever ou aprovar.
4. **Checkout (Paywall):** O presente final é montado, porém o texto da carta é ofuscado (efeito visual blur). Para desbloquear a versão final compartilhável, o Remetente realiza um pagamento via PIX ou Cartão (MercadoPago).
5. **A Surpresa (Destinatário):** O Destinatário recebe o link mágico. Ao abrir, a experiência interativa inicia com animações e trilha sonora, revelando a carta de amor limpa e a galeria de fotos.

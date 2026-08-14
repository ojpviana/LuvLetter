# 💌 LuvLetter

**Plataforma SaaS de presentes digitais românticos com temática Pixel Art / 8-bit / RPG.**

Crie uma carta de amor gerada por IA + galeria de fotos em uma experiência interativa única para o seu Player 2.

---

## 📁 Arquitetura do Projeto (Monolito Serverless)

Este projeto foi desenhado para ser implantado como um **monolito** na Vercel (Frontend e Backend compartilhando o mesmo domínio).

```
LuvLetter/
├── api/
│   └── index.js      # Entry point serverless para a Vercel
├── backend/          # Node.js + Express + Prisma + PostgreSQL (Supabase)
├── frontend/         # React + Vite + Tailwind CSS
└── vercel.json       # Configurações de rotas monolíticas para a Vercel
```

---

## 🚀 Setup Rápido (Local)

### 1. Pré-requisitos
- Node.js instalado
- Banco de dados PostgreSQL rodando (ex: Supabase)

### 2. Configurando o Backend

```bash
cd backend
npm install
cp .env.example .env   # Preencha as variáveis (DATABASE_URL, DIRECT_URL, etc)
npx prisma migrate dev --name init
npm run dev            # API rodará em http://localhost:3030
```

### 3. Configurando o Frontend

```bash
cd frontend
npm install
npm run dev            # Frontend rodará em http://localhost:5000 (o Vite fará o proxy das rotas /api para a porta 3030)
```

---

## ⚙️ Variáveis de Ambiente (backend/.env)

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | String de conexão para o Supabase (Transaction Pooler - Porta 6543) |
| `DIRECT_URL` | String de conexão direta para o Supabase (Porta 5432 - Usado apenas para Migrações do Prisma) |
| `GROQ_API_KEY` | Chave da [Groq Console](https://console.groq.com) |
| `R2_ACCOUNT_ID` | Account ID do Cloudflare |
| `R2_ACCESS_KEY_ID` | R2 Access Key |
| `R2_SECRET_ACCESS_KEY` | R2 Secret |
| `R2_BUCKET_NAME` | Nome do bucket R2 |
| `R2_PUBLIC_URL` | URL pública do bucket (ex: `https://cdn.seudominio.com`) |
| `MERCADOPAGO_ACCESS_TOKEN` | Token do [MercadoPago Developers](https://www.mercadopago.com.br/developers) |
| `WEBHOOK_SECRET` | Secret do webhook do Mercado Pago para verificação de assinaturas |
| `APP_URL` | URL pública da sua aplicação (ex: `https://seu-dominio.vercel.app`) |
| `GIFT_PRICE` | Preço em centavos (padrão: `990` = R$9,90) |

---

## 🛣️ Rotas da API

Todas as rotas do backend são prefixadas com `/api`. Em produção, a Vercel roteia `/api/*` para o nosso backend Node.js.

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/gifts` | Cria um novo presente (Player 1 e Player 2) |
| POST | `/api/gifts/:id/upload` | Faz o upload de até 6 fotos para o Cloudflare R2 |
| POST | `/api/gifts/:id/generate` | Gera o primeiro rascunho da carta com Groq IA |
| GET | `/api/gifts/:id/review` | Retorna o presente para revisão (texto claro) |
| POST | `/api/gifts/:id/regenerate` | Regera a carta com a IA |
| POST | `/api/gifts/:id/finalize` | Finaliza a carta (trava edições, cria unique_hash) |
| GET | `/api/gifts/:id/preview` | Preview do checkout (texto da carta embaçado se não pago) |
| POST | `/api/checkout` | Gera o link de pagamento do MercadoPago |
| POST | `/api/webhook` | Recebe as confirmações de pagamento do MercadoPago |
| GET | `/api/quest/:hash` | Acesso à experiência completa finalizada (apenas se pago) |

---

## 🎨 Fluxo do Usuário (Funnel de Vendas)

```
Home (formulário) → Upload de fotos → Geração → Review (edição/regeneração) → Checkout (preview borrado) → Pagamento PIX/Cartão → Quest Final
```

1. **Home** — Player 1 preenche o briefing de relacionamento.
2. **Upload** — Player 1 seleciona até 6 fotos memoráveis.
3. **Review** — Player 1 lê o rascunho da carta gerada pela IA, edita se quiser ou pede para a IA reescrever.
4. **Checkout** — A carta agora aparece bloqueada visualmente (efeito de embaçamento). Para desbloquear e gerar o link compartilhável, cobra-se R$ 9,90.
5. **Quest** — O Player 2 recebe o link. Ao abrir, interage com um "baú" em pixel art, libera a música romântica chiptune e lê a carta juntamente com a galeria.

---

## 🛠️ Stack Tecnológica & Produção

- **Infraestrutura**: Vercel (Serverless Functions via `vercel.json`)
- **Backend**: Node.js, Express.js
- **Banco de Dados**: PostgreSQL (hospedado no Supabase), Prisma ORM
- **Frontend**: React 18, Vite, Tailwind CSS, React Router v6
- **IA Generativa**: Groq API (modelo rápido e avançado)
- **Object Storage**: Cloudflare R2 (AWS S3 SDK via nativo)
- **Pagamentos**: MercadoPago API (com Webhooks autenticados)
- **Áudio**: Howler.js para reprodução garantida em navegadores mobile

---

## 🎵 Áudio

A página da "Quest" usa `Howler.js` para tocar sfx chiptune. O design atual tem áudio otimizado para que funcione tanto no mobile quanto no desktop.

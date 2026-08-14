# 🎮 Player 2 Luv

**Plataforma SaaS de presentes digitais românticos com temática Pixel Art / 8-bit / RPG.**

Crie uma carta de amor gerada por IA + galeria de fotos em uma experiência interativa única para o seu Player 2.

---

## 📁 Estrutura do Projeto

```
player-2-luv/
├── backend/          # Node.js + Express + Prisma + SQLite
└── frontend/         # React + Vite + Tailwind CSS
```

---

## 🚀 Setup Rápido

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # Preencha as variáveis
npx prisma migrate dev --name init
npm run dev            # Roda em http://localhost:3001
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev            # Roda em http://localhost:5173
```

---

## ⚙️ Variáveis de Ambiente (backend/.env)

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | Caminho SQLite: `file:../data/player2luv.db` |
| `GROQ_API_KEY` | Chave da [Groq Console](https://console.groq.com) |
| `R2_ACCOUNT_ID` | Account ID do Cloudflare |
| `R2_ACCESS_KEY_ID` | R2 Access Key |
| `R2_SECRET_ACCESS_KEY` | R2 Secret |
| `R2_BUCKET_NAME` | Nome do bucket R2 |
| `R2_PUBLIC_URL` | URL pública do bucket (ex: `https://cdn.seudominio.com`) |
| `MERCADOPAGO_ACCESS_TOKEN` | Token do [MercadoPago Developers](https://www.mercadopago.com.br/developers) |
| `APP_URL` | URL pública do seu backend (para webhooks) |
| `FRONTEND_URL` | URL do frontend (para CORS e redirects) |
| `GIFT_PRICE` | Preço em centavos (padrão: `2990` = R$29,90) |

---

## 🛣️ Rotas da API

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/gifts` | Cria um novo presente |
| POST | `/api/gifts/:id/upload` | Upload de até 6 fotos |
| POST | `/api/gifts/:id/generate` | Gera carta com Groq IA |
| GET | `/api/gifts/:id/preview` | Preview (carta borrada se não pago) |
| POST | `/api/checkout` | Gera link de pagamento MercadoPago |
| POST | `/api/webhook` | Webhook de pagamento |
| GET | `/api/quest/:hash` | Acesso público à quest completa (apenas se pago) |

---

## 🎨 Fluxo do Usuário

```
Home (formulário) → Upload de fotos → Checkout (preview borrado) → Pagamento PIX/Cartão → Quest (experiência completa)
```

1. **Home** — Player 1 preenche dados (nome, parceiro, tempo juntos, características)
2. **Upload** — Drag-and-drop de até 6 fotos; ao finalizar, a IA gera a carta
3. **Checkout** — Preview com carta borrada; CTA de desbloqueio por R$29,90
4. **Quest** — Baú de tesouro pixelado → clique → música chiptune → carta + galeria RPG

---

## 🛠️ Stack Tecnológica

- **Backend**: Node.js, Express.js, Prisma ORM, SQLite
- **Frontend**: React 18, Vite, Tailwind CSS, React Router v6
- **IA**: Groq API (Llama 3.3-70b-versatile)
- **Storage**: Cloudflare R2 (S3-compatible)
- **Pagamentos**: MercadoPago (PIX + cartão)
- **Áudio**: Howler.js
- **Upload**: Multer (memory storage → R2)

---

## 🎵 Áudio

A página Quest usa `Howler.js` para:
- **SFX de moeda** ao abrir o baú
- **Música chiptune** em loop durante a leitura

Substitua as URLs em `Quest.jsx` pelos seus arquivos de áudio hospedados.

---

## 📝 Notas de Desenvolvimento

- Em desenvolvimento, o MercadoPago usa `sandbox_init_point`; em produção, `init_point`
- O webhook do MercadoPago precisa de uma URL pública (use ngrok para testar localmente)
- A `unique_hash` usa nanoid(10) para URLs amigáveis
- Fotos são organizadas em R2 como `gifts/{giftId}/{uuid}.jpg`

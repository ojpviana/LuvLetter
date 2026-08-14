# 💌 LuvLetter

O LuvLetter é uma plataforma para a criação de presentes digitais personalizados. A proposta é permitir que casais enviem cartas de amor geradas por IA, acompanhadas de uma galeria de fotos, usando uma interface limpa e elegante.

---

## 🎯 O que o projeto faz?

O foco da plataforma é gerar uma experiência de compra rápida e entregar um presente que pareça natural e autêntico:

1. **Textos Humanos:** Usamos a API do Groq com instruções rigorosas para a IA gerar cartas casuais, que soam como mensagens reais do dia a dia, cortando a formalidade poética padrão dos modelos de linguagem.
2. **Design Elegante:** A interface foge de visuais poluídos. O foco é no minimalismo, simulando uma carta digital.
3. **Fluxo Simples:** O usuário monta a carta, revisa o texto, vê uma prévia bloqueada e faz o pagamento via Pix para liberar a URL final.

---

## 🛠️ Tecnologias Utilizadas

A arquitetura foi montada para ser leve, barata e fácil de manter:

* **Frontend:** React 18 + Vite + Tailwind CSS.
* **Backend:** Node.js com Express.
* **Banco de Dados:** PostgreSQL (hospedado no Supabase) integrado via Prisma ORM.
* **Inteligência Artificial:** Groq API para geração rápida de texto com o modelo Llama 3.
* **Armazenamento de Fotos:** Cloudflare R2.
* **Pagamentos:** Mercado Pago API com escuta de Webhooks.
* **Deploy:** Vercel.

---

## 🚀 Como Funciona o Sistema

1. **Preenchimento:** O usuário acessa o site, informa os nomes, escolhe o "estilo" do casal e clica em algumas tags de interesses comuns (ex: "Séries", "Vinho", "Trilhas").
2. **Envio das Imagens:** As fotos do casal são enviadas diretamente para o bucket do Cloudflare R2.
3. **Revisão da Carta:** O sistema gera a carta via IA. O usuário pode ler, pedir para o sistema gerar outra versão ou editar o texto livremente na própria tela.
4. **Pagamento e Liberação:** A plataforma monta o link final, mas exibe o conteúdo ofuscado. Após o pagamento via Mercado Pago, o sistema confirma o status pelo Webhook e libera o link.
5. **O Presente Final:** A pessoa que recebe acessa o link, clica em um envelope digital animado na tela e visualiza a carta de amor junto com o carrossel de fotos.

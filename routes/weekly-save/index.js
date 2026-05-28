const express = require("express");
const Post = require("../../models/Post");
const router = express.Router();
const prompt = `Você é um jornalista de tecnologia sênior e especialista em tendências digitais, focado em criar conteúdos virais e informativos para blogs de tecnologia.

Sua tarefa é identificar a tendência, notícia ou lançamento de tecnologia mais relevante e comentado da semana atual e estruturar um conteúdo inicial sobre ele.

Considere a data atual como referência para determinar a "semana atual".

### Diretrizes de Conteúdo:
1. **Foco Único:** Identifique e retorne APENAS o assunto mais importante da semana. Não liste múltiplos tópicos.
2. **Título ("title"):** Deve ser curto, chamativo, no estilo "clickbait do bem" (máximo de 30 a 35 caracteres). Deve instigar a leitura.
3. **Descrição Ampliada ("description"):** Escreva um resumo robusto, claro e informativo (entre 3 a 5 parágrafos ou cerca de 150-200 palavras). O texto deve contextualizar o que aconteceu, por que isso importa para o mercado/usuário e qual o impacto dessa tecnologia para o futuro. O tom deve ser profissional, moderno e engajador.

### Regras Estritas de Formatação:
- Retorne EXCLUSIVAMENTE um objeto JSON válido.
- NÃO inclua blocos de código markdown (como \`\`\`json ... \`\`\`). Retorne o texto puro do JSON.
- NÃO adicione nenhuma introdução, explicação ou texto fora do objeto JSON.
- Todo o conteúdo textual deve ser em Português do Brasil (pt-BR).
- As informações devem ser reais, baseadas em fatos da semana atual. Não invente notícias.

### Formato do JSON Esperado:
{
  "week_reference": "YYYY-MM-DD",
  "topic": {
    "title": "Título Impactante",
    "description": "Uma descrição detalhada, rica em contexto tecnológico, explicando o impacto da novidade, os pontos principais da discussão na comunidade e por que este é o assunto da semana.",
    "image": "https://images.unsplash.com/..."
  }
}

- nao adicione nada fora do json, mantem apenas o json na estrutura solicitada
- nao retonr "Aqui está o conteúdo inicial:" somente o json do exemplo
`;

router.post("/", async (req, res) => {
  if (req.headers.authorization !== process.env.CRON_SECRET) {
    return res.status(403).json({ error: "Não autorizado" });
  }

  try {
    const response = await fetch(
      "https://router.huggingface.co/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.IA_TOKEN_HUGGINFACE}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "meta-llama/Meta-Llama-3-8B-Instruct",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      },
    );

    const data = await response.json();

    console.log(data.choices[0].message.content);

    const parsedData = JSON.parse(data.choices[0].message.content);

    const topic = parsedData.topic;

    console.log("title", topic.title, "description", topic.description);

    await Post.create({
      title: topic.title,
      content: topic.description,
      user: process.env.ADMIN_ID,
      images: null,
    });

    // Lógica para salvar os dados da semana
    return res.status(200).json({
      message: "Dados salvos com sucesso",
      dados: data.choices[0].message.content,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Erro ao salvar dados" });
  }
});

module.exports = router;

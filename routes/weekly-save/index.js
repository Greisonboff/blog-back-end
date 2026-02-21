const express = require("express");
const Post = require("../../models/Post");
const router = express.Router();

const prompt = `Você é um especialista em tecnologia e tendências digitais.

Sua tarefa é:

1. Identificar o assunto de tecnologia mais comentado e relevante da semana atual.
2. Retornar somente um assunto da semana atual.
3. Gerar para o assunto:
   - "title": um título curto e chamativo (máximo 10 caracteres)
   - "description": um resumo claro e informativo (máximo 30 caracteres)

⚠️ Regras importantes:
- Retorne APENAS um JSON válido.
- Não inclua explicações fora do JSON.
- Não inclua markdown.
- Não inclua texto adicional.
- O JSON deve seguir exatamente este formato:
- somente um assunto da semana atual.
- em imagem coloque um link de imagem valido.

{
  "week_reference": "YYYY-MM-DD",
  "topic": 
    {
      "title": "Título aqui",
      "description": "Descrição aqui"
      "image": "Imagem aqui"
    }
    
}

- Use português do Brasil.
- Os assuntos devem ser reais e atuais.
- Não invente informações.
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

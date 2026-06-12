const express = require("express");
const Post = require("../../models/Post");
const huggingface = require("../ia/huggingface");
const tavilyGet = require("../ia/tavily");
const router = express.Router();
const wired = require("../search-feed/wired");

const prompt = `Você é especialista em tecnologia. Retorne apenas 1 tema de tecnologia mais relevante da semana atual. Responda somente com JSON válido, sem markdown ou texto extra. Use português do Brasil, informações reais e atuais e uma URL de imagem válida.

{"week_reference":"YYYY-MM-DD","topic":{"title":"Até 30 caracteres","description":"Resumo","image":"https://imagem.jpg"}}`;

router.post("/", async (req, res) => {
  if (req.headers.authorization !== process.env.CRON_SECRET) {
    return res.status(403).json({ success: false, message: "não autorizado" });
  }

  const providers = [
    () => tavilyGet(prompt),
    () => huggingface(prompt),
    () => wired(),
  ];

  let response = null;

  for (const provider of providers) {
    response = await provider();

    if (response?.success) {
      break;
    }
  }

  if (!response || !response.success) {
    return res
      .status(500)
      .json({ success: false, message: "erro ao buscar notícias" });
  }

  console.log(" a resposta e:", response);

  try {
    const { data } = response;

    await Promise.all(
      data.map((article) =>
        Post.create({
          title: article.title,
          content: article.content,
          user: process.env.ADMIN_ID,
          images: null,
        }),
      ),
    );

    console.log("dados salvos com sucesso");

    return res.status(200).json(response);
  } catch (error) {
    console.error("erro ao salvar dados de notícias da semana:", error);

    return res.status(500).json({
      success: false,
      message: "erro ao salvar dados",
    });
  }
});

module.exports = router;

const express = require("express");
const Post = require("../../models/Post");
const router = express.Router();
const { XMLParser } = require("fast-xml-parser");

router.post("/", async (req, res) => {
  if (req.headers.authorization !== process.env.CRON_SECRET) {
    return res.status(403).json({ success: false, message: "não autorizado" });
  }

  const getNews = await fetch("https://www.wired.com/feed/rss");
  const xml = await getNews.text();

  const parser = new XMLParser({
    ignoreAttributes: false,
  });

  const rssObject = parser.parse(xml);

  const article = rssObject.rss.channel.item[0];

  try {
    //   const response = await fetch(
    //     "https://router.huggingface.co/v1/chat/completions",
    //     {
    //       method: "POST",
    //       headers: {
    //         Authorization: `Bearer ${process.env.IA_TOKEN_HUGGINFACE}`,
    //         "Content-Type": "application/json",
    //         "Cache-Control": "no-cache",
    //       },
    //       body: JSON.stringify({
    //         model: "meta-llama/Meta-Llama-3-8B-Instruct",
    //         messages: [
    //           {
    //             role: "user",
    //             content: prompt,
    //           },
    //         ],
    //       }),
    //     },
    //   );

    await Post.create({
      title: article.title.replace(/"/g, '\\"'),
      content: article.description.replace(/"/g, '\\"'),
      user: process.env.ADMIN_ID,
      images: null,
    });

    // Lógica para salvar os dados da semana
    return res.status(200).json({
      success: true,
      message: "dados salvos com sucesso",
      data: {
        week_reference: new Date().toISOString().split("T")[0],
        topic: {
          title: article.title.replace(/"/g, '\\"'),
          description: article.description.replace(/"/g, '\\"'),
          image: null,
        },
      },
    });
  } catch (error) {
    console.error("erro ao salvar dados:", error);
    return res
      .status(500)
      .json({ success: false, message: "erro ao salvar dados" });
  }
});

module.exports = router;

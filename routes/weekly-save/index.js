const express = require("express");
const Post = require("../../models/Post");
const router = express.Router();
const { fetchTrendingNews } = require("../../services/news-client");

router.post("/", async (req, res) => {
  try {
    if (req.headers.authorization !== process.env.CRON_SECRET) {
      return res
        .status(403)
        .json({ success: false, message: "não autorizado" });
    }

    const response = await fetchTrendingNews();

    console.log(response);
    if (!response || !response.sucess) {
      return res
        .status(500)
        .json({ success: false, message: "erro ao buscar notícias" });
    }

    const { data } = response;

    let novoPost = null;

    for (const article of data) {
      const hasPost = await Post.findOne({
        title: article.title,
      });

      if (!hasPost) {
        novoPost = article;
        break;
      }
    }

    if (!novoPost) {
      return res.status(200).json({
        success: false,
        message: "Nenhuma notícia nova encontrada",
        data: null,
      });
    }

    await Post.create({
      title: novoPost.title,
      content: novoPost.content,
      user: process.env.ADMIN_ID,
      images: null,
    });

    return res.status(200).json({
      success: true,
      message: "sucesso ao salvar dados",
      data: novoPost,
    });
  } catch (error) {
    console.error("erro ao salvar dados de notícias da semana:", error);

    return res.status(500).json({
      success: false,
      message: "erro ao salvar dados",
      data: null,
    });
  }
});

module.exports = router;

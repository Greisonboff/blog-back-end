const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Post = require("../../../models/Post");
const authMiddleware = require("../../../middleware/authMiddleware");

//like
router.patch("/like", authMiddleware, async (req, res) => {
  const { id, likeType } = req.body;

  const userId = req.user.id;

  if (!id || !userId || !likeType) {
    return res
      .status(422)
      .json({ success: false, message: "dados incompletos" });
  }

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ success: false, message: "id inválido" });
  }

  try {
    if (likeType === "unlike") {
      const result = await Post.updateOne(
        { _id: id },
        { $pull: { likes: { userId: userId } } },
      );

      if (result.matchedCount === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Post não encontrado" });
      }

      return res
        .status(200)
        .json({ success: true, message: "post descurtido com sucesso" });
    }

    // só adiciona a curtida se o usuário ainda não curtiu (operação atômica)
    const result = await Post.updateOne(
      { _id: id, "likes.userId": { $ne: userId } },
      { $push: { likes: { userId: userId } } },
    );

    if (result.matchedCount === 0 && !(await Post.exists({ _id: id }))) {
      return res
        .status(404)
        .json({ success: false, message: "Post não encontrado" });
    }

    res
      .status(200)
      .json({ success: true, message: "post curtido com sucesso" });
  } catch (error) {
    console.error("erro ao curtir post:", error);
    res
      .status(500)
      .json({ success: false, message: "erro interno do servidor" });
  }
});

module.exports = router;

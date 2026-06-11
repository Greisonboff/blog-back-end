const express = require("express");
const router = express.Router();

const Post = require("../../../../models/Post");
const Person = require("../../../../models/Person");
const authMiddleware = require("../../../../middleware/authMiddleware");

const { ObjectId } = require("mongodb");

//comment
router.patch("/comment", authMiddleware, async (req, res) => {
  const { id, comment } = req.body;

  const userId = req.user.id;

  if (!userId) {
    return res
      .status(422)
      .json({ success: false, message: "dados incompletos" });
  }

  if (!id || !comment) {
    return res
      .status(422)
      .json({ success: false, message: "dados incompletos" });
  }

  const commentObj = {
    comment,
    user: userId,
  };

  try {
    await Post.findByIdAndUpdate(id, {
      $addToSet: { comments: commentObj },
    });
    res
      .status(200)
      .json({ success: true, message: "comentario adicionado com sucesso" });
  } catch (error) {
    console.error("erro ao comentar post:", error);
    res
      .status(500)
      .json({ success: false, message: "erro interno do servidor" });
  }
});

module.exports = router;

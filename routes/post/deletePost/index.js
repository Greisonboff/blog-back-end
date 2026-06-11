const express = require("express");
const router = express.Router();

const Post = require("../../../models/Post");
const authMiddleware = require("../../../middleware/authMiddleware");

//delete
router.delete("/:id", authMiddleware, async (req, res) => {
  const id = req.params.id;
  try {
    const post = await Post.findById(id);
    if (!post)
      return res
        .status(404)
        .json({ success: false, message: "Post não encontrado" });

    if (post.user.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, message: "não autorizado" });
    }

    await post.deleteOne();
    res
      .status(200)
      .json({ success: true, message: "post deletado com sucesso" });
  } catch (error) {
    console.error("erro ao deletar post:", error);
    res
      .status(500)
      .json({ success: false, message: "erro interno do servidor" });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();

const Post = require("../../../../models/Post");

const authMiddleware = require("../../../../middleware/authMiddleware");

//update comment
router.delete(
  "/comment/:postId/:commentId",
  authMiddleware,
  async (req, res) => {
    const { postId, commentId } = req.params;

    if (!postId || !commentId) {
      return res
        .status(422)
        .json({ success: false, message: "dados incompletos" });
    }

    try {
      const updatedPost = await Post.findOneAndUpdate(
        {
          _id: postId,
        },
        {
          $pull: {
            comments: {
              _id: commentId,
            },
          },
        },
        { new: true }, // Retorna o documento atualizado
      );

      if (!updatedPost) {
        return res
          .status(404)
          .json({ success: false, message: "post nao encontrado" });
      }

      res
        .status(200)
        .json({ success: true, message: "comentario deletado com sucesso" });
    } catch (error) {
      console.error("erro ao deletar comentario:", error);
      res
        .status(500)
        .json({ success: false, message: "erro interno do servidor" });
    }
  },
);

module.exports = router;

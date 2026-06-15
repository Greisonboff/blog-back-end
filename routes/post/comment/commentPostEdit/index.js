const express = require("express");
const router = express.Router();
const Post = require("../../../../models/Post");
const authMiddleware = require("../../../../middleware/authMiddleware");
const { ObjectId } = require("mongodb");

//update comment
router.patch(
  "/comment/:postId/:commentId",
  authMiddleware,
  async (req, res) => {
    const { postId, commentId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(422).json({
        success: false,
        message: "pelo menos um campo deve ser enviado",
      });
    }

    const userId = req.user.id ? req.user.id : null;

    try {
      const updatedPost = await Post.findOneAndUpdate(
        {
          _id: postId,
          comments: {
            $elemMatch: {
              _id: commentId,
              user: userId,
            },
          },
        },
        {
          $set: {
            "comments.$.comment": content, // Atualiza o campo 'texto' do comentário
            // Adicione outros campos se necessário (ex: 'comentarios.$.autor')
          },
        },
        { new: true }, // Retorna o documento atualizado
      );

      if (!updatedPost) {
        return res.status(404).json({
          success: false,
          message: "post ou comentário nao encontrado",
        });
      }

      res
        .status(200)
        .json({ success: true, message: "comentário atualizado com sucesso" });
    } catch (error) {
      console.error("erro ao atualizar comentário:", error);
      res
        .status(500)
        .json({ success: false, message: "erro interno do servidor" });
    }
  },
);

module.exports = router;

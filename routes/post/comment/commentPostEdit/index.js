const express = require("express");
const router = express.Router();
const Post = require("../../../../models/Post");
const authMiddleware = require("../../../../middleware/authMiddleware");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");

//update comment
router.patch(
  "/comment/:postId/:commentId",
  authMiddleware,
  async (req, res) => {
    const { postId, commentId } = req.params;
    const { content } = req.body;
    console.log("content", postId, "commetn", commentId);
    if (!content) {
      return res
        .status(422)
        .json({ isValid: false, error: "At least one field must be sent" });
    }

    const token = req.cookies.token;

    const decodedUserId = token
      ? jwt.verify(token, process.env.JWT_SECRET)
      : { id: null };

    try {
      const updatedPost = await Post.findOneAndUpdate(
        {
          _id: postId,
          comments: {
            $elemMatch: {
              _id: commentId,
              user: decodedUserId.id,
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
        return res
          .status(404)
          .json({ isValid: false, error: "Post or comment not found" });
      }

      res
        .status(200)
        .json({ isValid: true, message: "Comment updated successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ isValid: false, error: error });
    }
  },
);

module.exports = router;

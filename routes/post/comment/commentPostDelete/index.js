
const express = require('express');
const router = express.Router();

const Post = require("../../../../models/Post");

const authMiddleware = require('../../../../middleware/authMiddleware');

//update comment
router.delete("/comment/:postId/:commentId", authMiddleware, async (req, res) => {
  const { postId, commentId } = req.params;

  if (!postId || !commentId) {
    return res.status(422).json({ isValid: false, error: "Invalid data" });
  }

  try {

    const updatedPost = await Post.findOneAndUpdate(
      {
        _id: postId
      }, {
      $pull: {
        comments: {
          _id: commentId
        }
      }
    },
      { new: true } // Retorna o documento atualizado
    );

    if (!updatedPost) {
      return res.status(404).json({ isValid: false, error: "Post or comment not found" });
    }

    res.status(200).json({ isValid: true, message: "Comment deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ isValid: false, error: error });
  }
})

module.exports = router;
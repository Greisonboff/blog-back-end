const express = require("express");
const router = express.Router();

const Post = require("../../../models/Post");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../../../middleware/authMiddleware");

//delete
router.delete("/:id", authMiddleware, async (req, res) => {
  const id = req.params.id;
  try {
    const post = await Post.findById(id);
    if (!post)
      return res
        .status(404)
        .json({ isValid: false, error: "Post não encontrado" });

    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({ isValid: false, error: "Não autorizado" });
    }

    await post.deleteOne();
    res
      .status(200)
      .json({ isValid: true, message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ isValid: false, error: "Internal server error" });
  }
});

module.exports = router;

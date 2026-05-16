const express = require("express");
const router = express.Router();

const Post = require("../../../models/Post");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../../../middleware/authMiddleware");

//like
router.patch("/like", authMiddleware, async (req, res) => {
  const { id, likeType } = req.body;

  const userId = req.user.id;

  if (!id || !userId || !likeType) {
    return res.status(422).json({ error: "Dados incompletos" });
  }

  try {
    if (likeType === "unlike") {
      await Post.findByIdAndUpdate(id, {
        $pull: { likes: { userId: userId } },
      });
      res
        .status(200)
        .json({ isValid: true, message: "Post unliked successfully" });
      return;
    }

    await Post.findByIdAndUpdate(id, {
      $addToSet: { likes: { userId: userId } },
    });
    res.status(200).json({ isValid: true, message: "Post liked successfully" });
  } catch (error) {
    res.status(500).json({ isValid: false, error: "Internal server error" });
  }
});

module.exports = router;

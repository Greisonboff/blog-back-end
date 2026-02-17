const express = require('express');
const router = express.Router();

const Post = require("../../../models/Post");
const jwt = require('jsonwebtoken');
const authMiddleware = require('../../../middleware/authMiddleware');

//like
router.patch("/like", authMiddleware, async (req, res) => {
  const { id, likeType, userName } = req.body;


  const token = req.cookies.token;

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log("decoded: ", decoded);
  const userId = decoded.id;

  if (!id || !userId || !userName || !likeType) {
    return res.status(422).json({ error: "Dados incompletos" });
  }

  try {
    if (likeType === "unlike") {
      await Post.findByIdAndUpdate(id, {
        $pull: { likes: { userId: userId, name: userName } },
      });
      res.status(200).json({ isValid: true, message: "Post unliked successfully" });
      return;
    }

    await Post.findByIdAndUpdate(id, {
      $addToSet: { likes: { userId: userId, name: userName } },
    });
    res.status(200).json({ isValid: true, message: "Post liked successfully" });
  } catch (error) {
    res.status(500).json({ isValid: false, error: error });
  }
})

module.exports = router;
const express = require('express');
const router = express.Router();

const Post = require("../../../../models/Post");
const Person = require("../../../../models/Person");
const jwt = require('jsonwebtoken');
const authMiddleware = require('../../../../middleware/authMiddleware');

const { ObjectId } = require('mongodb');

//comment
router.patch("/comment", authMiddleware, async (req, res) => {
  const { id, comment } = req.body;

  const token = req.cookies.token;

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const userId = decoded.id;

  if (!userId) {
    return res.status(422).json({ isValid: false, error: "user is required" });
  }

  if (!id || !comment) {
    return res.status(422).json({ isValid: false, error: "Dados incompletos" });
  }

  const commentObj = {
    comment,
    user: userId
  };

  try {
    await Post.findByIdAndUpdate(id, {
      $addToSet: { comments: commentObj },
    });
    res.status(200).json({ isValid: true, message: "Comment added successfully" });
  } catch (error) {
    res.status(500).json({ isValid: false, error: error });
  }
})

module.exports = router;
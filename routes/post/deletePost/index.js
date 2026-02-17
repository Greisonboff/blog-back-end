const express = require('express');
const router = express.Router();

const Post = require("../../../models/Post");
const jwt = require('jsonwebtoken');
const authMiddleware = require('../../../middleware/authMiddleware');

//delete
router.delete("/:id", authMiddleware, async (req, res) => {
  const id = req.params.id;
  try {
    await Post.findByIdAndDelete(id);
    res.status(200).json({ isValid: true, message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ isValid: false, error: error });
  }
})

module.exports = router;
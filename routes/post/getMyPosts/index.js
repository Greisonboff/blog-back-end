const express = require("express");
const router = express.Router();

const Post = require("../../../models/Post");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../../../middleware/authMiddleware");
const { formatPostData } = require("../../../utils/formatPostData");

//get my posts
router.post("/my-posts", authMiddleware, async (req, res) => {
  try {
    const { page, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const token = req.cookies.token;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decoded.id;

    const posts = await Post.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("user", "name img avatarColar");

    const total = await Post.find({ user: userId }).countDocuments();

    const data = formatPostData(posts, decoded);

    res.status(200).json({
      isValid: true,
      posts: data,
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ isValid: false, error: "Internal server error" });
  }
});

module.exports = router;

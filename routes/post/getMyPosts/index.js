const express = require("express");
const router = express.Router();

const Post = require("../../../models/Post");
const authMiddleware = require("../../../middleware/authMiddleware");
const { formatPostData } = require("../../../utils/formatPostData");
const { parsePagination } = require("../../../utils/pagination");

//get my posts
router.post("/my-posts", authMiddleware, async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);

    const decoded = req.user;
    const userId = decoded.id;

    const posts = await Post.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "name img avatarColar");

    const total = await Post.countDocuments({ user: userId });

    const data = formatPostData(posts, decoded);

    res.status(200).json({
      success: true,
      posts: data,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("erro ao buscar posts:", error);
    res
      .status(500)
      .json({ success: false, message: "erro interno do servidor" });
  }
});

module.exports = router;

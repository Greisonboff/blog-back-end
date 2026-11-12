const express = require("express");
const router = express.Router();

const Post = require("../../../models/Post");
const jwt = require("jsonwebtoken");

const { formatPostData } = require("../../../utils/formatPostData");
const { parsePagination } = require("../../../utils/pagination");

// token ausente, expirado ou inválido: trata como visitante
function decodeOptionalToken(token) {
  if (!token) return { id: null };

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return { id: null };
  }
}

//get all posts
router.get("/", async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "name img avatarColar")
      .populate("comments.user", "name img avatarColar");

    const decoded = decodeOptionalToken(req.cookies.token);

    const total = await Post.countDocuments();

    const data = formatPostData(posts, decoded);

    res.status(200).json({
      success: true,
      posts: data,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("erro ao buscar posts: ", error);
    res
      .status(500)
      .json({ success: false, message: "erro interno do servidor" });
  }
});

module.exports = router;

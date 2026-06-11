const express = require("express");
const router = express.Router();

const Post = require("../../../models/Post");
const jwt = require("jsonwebtoken");
const Person = require("../../../models/Person");

const { ObjectId } = require("mongodb");
const { formatPostData } = require("../../../utils/formatPostData");

//get all posts
router.get("/", async (req, res) => {
  try {
    const { page, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("user", "name img avatarColar -_id")
      .populate("comments.user");

    const token = req.cookies.token;

    const decoded = token
      ? jwt.verify(token, process.env.JWT_SECRET)
      : { id: null };

    const total = await Post.countDocuments();

    const data = formatPostData(posts, decoded);

    res.status(200).json({
      success: true,
      posts: data,
      total,
      currentPage: Number(page),
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

const express = require("express");
const router = express.Router();

const Post = require("../../../models/Post");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../../../middleware/authMiddleware");
const Person = require("../../../models/Person");

const { ObjectId } = require("mongodb");

const multer = require("multer");

const path = require("path");
const { handleImageUpload } = require("../../../middleware/handleImageUpload");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

//create
router.post(
  "/",
  upload.array("images", 5),
  authMiddleware,
  handleImageUpload,
  async (req, res) => {
    const { title, description, category, content } = req.body;

    const imagePath = req.uploadedImage;

    if (!title) {
      return res
        .status(422)
        .json({ isValid: false, error: "title is required" });
    }

    if (!content) {
      return res
        .status(422)
        .json({ isValid: false, error: "content is required" });
    }

    const post = {
      title,
      description,
      category,
      content,
      images: imagePath?.url ? [imagePath.url] : [],
      user: req.user.id,
    };

    try {
      await Post.create(post);
      res
        .status(200)
        .json({ isValid: true, message: "Post created successfully" });
    } catch (error) {
      res.status(500).json({ isValid: false, error: "Internal server error" });
    }
  },
);

module.exports = router;

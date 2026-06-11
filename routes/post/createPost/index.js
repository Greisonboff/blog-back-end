const express = require("express");
const router = express.Router();

const Post = require("../../../models/Post");
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
        .json({ success: false, message: "title is required" });
    }

    if (!content) {
      return res
        .status(422)
        .json({ success: false, message: "content is required" });
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
        .json({ success: true, message: "post criado com sucesso" });
    } catch (error) {
      console.error("erro ao criar post:", error);
      res
        .status(500)
        .json({ success: false, message: "erro interno do servidor" });
    }
  },
);

module.exports = router;

const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Post = require("../../../models/Post");

const authMiddleware = require("../../../middleware/authMiddleware");

const multer = require("multer");

const path = require("path");

const { handleImageUpload } = require("../../../middleware/handleImageUpload");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

//update
router.patch(
  "/:id",
  upload.array("images", 5),
  authMiddleware,
  // verifica dono antes de enviar qualquer imagem ao Cloudinary
  async (req, res, next) => {
    const id = req.params.id;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "id inválido" });
    }

    try {
      const post = await Post.findById(id).select("user");

      if (!post) {
        return res
          .status(404)
          .json({ success: false, message: "Post não encontrado" });
      }

      if (post.user?.toString() !== req.user.id) {
        return res
          .status(403)
          .json({ success: false, message: "não autorizado" });
      }

      next();
    } catch (error) {
      next(error);
    }
  },
  handleImageUpload,
  async (req, res) => {
    const id = req.params.id;
    const { title, description, category, content, removeImage } = req.body;

    if (!title && !description && !category && !content && !removeImage) {
      return res.status(422).json({
        success: false,
        message: "pelo menos um campo deve ser enviado.",
      });
    }

    const imagePath = req.uploadedImage;

    const post = { updatedAt: Date.now() };

    if (title) post.title = title;
    if (description) post.description = description;
    if (category) post.category = category;
    if (content) post.content = content;
    if (imagePath?.url) post.images = [imagePath.url];

    if (removeImage === "true") {
      post.images = [];
    }

    try {
      await Post.findByIdAndUpdate(id, post);
      res
        .status(200)
        .json({ success: true, message: "post atualizado com sucesso" });
    } catch (error) {
      console.error("erro ao atualizar post:", error);
      res
        .status(500)
        .json({ success: false, message: "erro interno do servidor" });
    }
  },
);

module.exports = router;

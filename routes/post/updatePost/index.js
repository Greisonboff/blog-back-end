const express = require("express");
const router = express.Router();

const Post = require("../../../models/Post");

const authMiddleware = require("../../../middleware/authMiddleware");

const multer = require("multer");

const path = require("path");
const { deleteOldImage } = require("../../../utils/deleleOldImags");

const errorImageTypeMessage = new Error(
  "Only .png, .jpg and .jpeg format allowed!",
);
const upload = multer({
  storage: multer.diskStorage({
    destination: "public/uploads/post",
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + uniqueSuffix + ext);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(errorImageTypeMessage, false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

//update
router.patch(
  "/:id",
  authMiddleware,
  (req, res, next) => {
    upload.array("images", 5)(req, res, function (err) {
      if (err === errorImageTypeMessage) {
        return res.status(422).json({
          isValid: false,
          error: "Only .png, .jpg and .jpeg format allowed!",
        });
      }
      if (err) {
        return res.status(500).json({
          isValid: false,
          error: err.message,
        });
      }
      next();
    });
  },
  async (req, res) => {
    const id = req.params.id;
    const { title, description, category, content, removeImage } = req.body;

    if (!title && !description && !category && !content && !removeImage) {
      return res
        .status(422)
        .json({ isValid: false, error: "At least one field must be sent" });
    }

    let imagesPath = null;

    if (req.files && req.files.length > 0) {
      imagesPath = req.files.map((file) => `/uploads/post/${file.filename}`);
    }

    const post = {};

    if (title) post.title = title;
    if (description) post.description = description;
    if (category) post.category = category;
    if (content) post.content = content;

    const postImages = await Post.findOne({ _id: id });

    if (imagesPath) {
      post.images = imagesPath;

      if (postImages?.images) {
        postImages.images.forEach((image) => {
          deleteOldImage(image);
        });
      }
    }

    if (removeImage === "true") {
      post.images = [];

      if (postImages?.images) {
        postImages.images.forEach((image) => {
          deleteOldImage(image);
        });
      }
    }

    try {
      await Post.findByIdAndUpdate(id, post);
      res
        .status(200)
        .json({ isValid: true, message: "Post updated successfully" });
    } catch (error) {
      res.status(500).json({ isValid: false, error: error });
    }
  },
);

module.exports = router;

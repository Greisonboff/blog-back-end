const express = require("express");
const router = express.Router();

const Person = require("../../../models/Person");
const { hashPassword } = require("../../../utils/hashPassword");
const { isValidEmail } = require("../../../utils/isValidEmail");
const authMiddleware = require("../../../middleware/authMiddleware");
const jwt = require("jsonwebtoken");
const { deleteOldImage } = require("../../../utils/deleleOldImags");
const path = require("path");

const errorImageTypeMessage = "Only .png, .jpg and .jpeg format allowed!";
const multer = require("multer");
const upload = multer({
  storage: multer.diskStorage({
    destination: "public/uploads/userAvatar",
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
      cb(new Error(errorImageTypeMessage), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

//update user by id
router.patch(
  "/",
  authMiddleware,
  (req, res, next) => {
    upload.single("img")(req, res, function (err) {
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
    const token = req.cookies.token;

    const decodedUserId = token
      ? jwt.verify(token, process.env.JWT_SECRET)
      : { id: null };

    const { name, email, password, confirmPassword, img } = req.body;

    const person = {};

    const imagePath = req.file
      ? `/uploads/userAvatar/${req.file.filename}`
      : null;

    const currentPerson = await Person.findOne({ _id: decodedUserId.id });

    if (imagePath || img === "null") {
      person.img = imagePath;
      deleteOldImage(currentPerson.img);
    }

    if (!name && !email && !password && !confirmPassword) {
      return res
        .status(422)
        .json({ error: "At least one field must be sent", isValid: false });
    }

    if (password && password !== confirmPassword) {
      return res
        .status(422)
        .json({ error: "passwords do not match", isValid: false });
    }

    if (name) {
      person.name = name;
    }

    if (email) {
      if (!isValidEmail(email)) {
        return res
          .status(422)
          .json({ error: "email is invalid", isValid: false });
      }
      person.email = email;
    }

    if (password) {
      person.password = await hashPassword(password);
    }

    try {
      const updatedPerson = await Person.updateOne(
        { _id: decodedUserId.id },
        person,
      );

      if (updatedPerson.matchedCount === 0) {
        return res
          .status(424)
          .json({ message: "Person not found", isValid: false });
      }

      res.status(200).json({
        message: "Person updated successfully",
        isValid: true,
        person: person,
      });
    } catch (error) {
      res.status(500).json({ error: error, isValid: false });
    }
  },
);

module.exports = router;

const express = require("express");
const router = express.Router();

const Person = require("../../../models/Person");
const { hashPassword } = require("../../../utils/hashPassword");
const { isValidEmail } = require("../../../utils/isValidEmail");
const authMiddleware = require("../../../middleware/authMiddleware");
const multer = require("multer");
const { handleImageUpload } = require("../../../middleware/handleImageUpload");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.patch(
  "/",
  authMiddleware,
  upload.single("img"),
  async (req, res, next) => {
    const currentPerson = await Person.findById(req.user.id);

    if (!currentPerson) {
      return res.status(424).json({ message: "Person not found" });
    }

    req.currentImagePublicId = currentPerson.img?.public_id;
    req.currentPerson = currentPerson;
    next();
  },
  handleImageUpload,
  async (req, res) => {
    try {
      const userId = req.user.id;

      const { name, email, img, password, confirmPassword } = req.body;

      const { currentPerson } = req;

      console.log("Received data:", {
        name,
        email,
        img,
      });

      if (!name && !email && !password && !confirmPassword) {
        return res
          .status(422)
          .json({ error: "At least one field must be sent", isValid: false });
      }

      const imagePath = req.uploadedImage;

      const person = {};

      if (imagePath || img === "null") {
        person.img = imagePath;
      }

      if (password && password !== confirmPassword) {
        return res
          .status(422)
          .json({ error: "passwords do not match", isValid: false });
      }

      if (name && currentPerson.name !== name) {
        person.name = name;
      }

      if (email && currentPerson.email !== email) {
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

      const updatedPerson = await Person.updateOne({ _id: userId }, person);

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
      console.error(error);
      res.status(500).json({ error: error, isValid: false });
    }
  },
);

module.exports = router;

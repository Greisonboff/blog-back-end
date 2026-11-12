const express = require("express");
const router = express.Router();

const Person = require("../../../models/Person");
const { hashPassword } = require("../../../utils/hashPassword");
const { isValidEmail } = require("../../../utils/isValidEmail");
const authMiddleware = require("../../../middleware/authMiddleware");
const multer = require("multer");
const { handleImageUpload } = require("../../../middleware/handleImageUpload");
const { cloudinaryDelete } = require("../../../utils/cloudinaryUpload");
const { normalizeEmail } = require("../../../utils/normalizeEmail");

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
      return res
        .status(424)
        .json({ success: false, message: "usuario nao encontrado" });
    }

    req.currentImagePublicId = currentPerson.img?.public_id;
    req.currentPerson = currentPerson;
    next();
  },
  handleImageUpload,
  async (req, res) => {
    try {
      const userId = req.user.id;

      const { name, img, password, confirmPassword } = req.body;
      const email = normalizeEmail(req.body.email);

      const { currentPerson } = req;

      const imagePath = req.uploadedImage;

      // contrato da imagem: arquivo novo substitui; img=delete remove e apaga
      // no Cloudinary; qualquer outro valor (inclusive "null") mantém a atual
      const removeImage = !imagePath && img === "delete";

      if (
        !name &&
        !email &&
        !password &&
        !confirmPassword &&
        !imagePath &&
        !removeImage
      ) {
        return res.status(422).json({
          success: false,
          message: "pelo menos um campo deve ser enviado.",
        });
      }

      const person = {};

      if (imagePath) {
        person.img = imagePath;
      } else if (removeImage) {
        person.img = null;
      }

      if (password && password !== confirmPassword) {
        return res
          .status(422)
          .json({ success: false, message: "passwords do not match" });
      }

      if (name && currentPerson.name !== name) {
        person.name = name;
      }

      if (email && currentPerson.email !== email) {
        const validateEmail = await isValidEmail(email);
        if (!validateEmail.success) {
          return res
            .status(422)
            .json({ success: false, message: validateEmail.message });
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
          .json({ success: false, message: "usuario nao encontrado" });
      }

      if (removeImage) {
        await cloudinaryDelete(currentPerson.img?.public_id);
      }

      // nunca devolver o hash da senha
      const { password: _password, ...personResponse } = person;

      res.status(200).json({
        message: "usuario atualizado com sucesso",
        success: true,
        person: personResponse,
      });
    } catch (error) {
      console.error("erro ao atualizar usuário:", error);
      if (error.code === 11000) {
        return res
          .status(400)
          .json({ success: false, message: "email ja cadastrado" });
      }
      res
        .status(500)
        .json({ success: false, message: "erro interno do servidor" });
    }
  },
);

module.exports = router;

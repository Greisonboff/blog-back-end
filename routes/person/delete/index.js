const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Person = require("../../../models/Person");
const Post = require("../../../models/Post");
const authMiddleware = require("../../../middleware/authMiddleware");
const { cloudinaryDelete } = require("../../../utils/cloudinaryUpload");

//delete user by id (somente a própria conta ou o admin)
router.delete("/:id", authMiddleware, async (req, res) => {
  const id = req.params.id;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ success: false, message: "id inválido" });
  }

  const isSelf = req.user.id === id;
  const isAdmin = Boolean(process.env.ADMIN_ID) && req.user.id === process.env.ADMIN_ID;

  if (!isSelf && !isAdmin) {
    return res.status(403).json({ success: false, message: "não autorizado" });
  }

  try {
    const person = await Person.findById(id);

    if (!person) {
      return res
        .status(404)
        .json({ success: false, message: "usuario nao encontrado" });
    }

    await Post.deleteMany({ user: person._id });
    await person.deleteOne();
    await cloudinaryDelete(person.img?.public_id);

    if (isSelf) {
      res.clearCookie("token", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });
    }

    res
      .status(200)
      .json({ success: true, message: "usuario deletado com sucesso" });
  } catch (error) {
    console.error("erro ao deletar usuário:", error);
    res
      .status(500)
      .json({ success: false, message: "erro interno do servidor" });
  }
});

module.exports = router;

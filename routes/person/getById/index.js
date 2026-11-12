const express = require("express");
const router = express.Router();

const Person = require("../../../models/Person");
const authMiddleware = require("../../../middleware/authMiddleware");

//get one user by id
router.get("/id", authMiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    const person = await Person.findOne({ _id: userId });

    if (!person) {
      return res
        .status(424)
        .json({ success: false, message: "usuario nao encontrado" });
    }

    const data = {
      name: person.name,
      email: person.email,
      img: person.img,
    };

    res.status(200).json({ success: true, data: data });
  } catch (error) {
    console.error("erro ao buscar usuário:", error);
    res
      .status(500)
      .json({ success: false, message: "erro interno do servidor" });
  }
});

module.exports = router;

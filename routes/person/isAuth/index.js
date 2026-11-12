const express = require("express");
const router = express.Router();

const Person = require("../../../models/Person");
const authMiddleware = require("../../../middleware/authMiddleware");

router.get("/isAuth", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const person = await Person.findOne({ _id: userId });

    // token válido, mas o usuário não existe mais
    if (!person) {
      return res.status(401).json({
        success: false,
        isLoggedIn: false,
        message: "usuario nao encontrado",
      });
    }

    res.status(200).json({
      success: true,
      isLoggedIn: true,
      user: {
        name: person.name,
        email: person.email,
        img: person.img,
        avatarColar: person.avatarColar,
      },
    });
  } catch (error) {
    console.error("erro ao verificar autenticacao:", error);

    res.status(500).json({
      success: false,
      isLoggedIn: false,
      message: "erro interno do servidor",
    });
  }
});

module.exports = router;

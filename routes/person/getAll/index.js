const express = require("express");
const router = express.Router();

const Person = require("../../../models/Person");
// get all users
router.get("/", async (req, res) => {
  try {
    const people = await Person.find().select("name email img avatarColar");

    res.status(200).json({ success: true, data: people });
  } catch (error) {
    console.error("erro ao buscar usuários:", error);
    res
      .status(500)
      .json({ success: false, message: "erro interno do servidor" });
  }
});

module.exports = router;

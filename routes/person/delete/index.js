const express = require("express");
const router = express.Router();

const Person = require("../../../models/Person");

//delete user by id
router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const deletedPerson = await Person.deleteOne({ _id: id });

    if (deletedPerson.deletedCount === 0) {
      return res
        .status(424)
        .json({ success: false, message: "usuario nao encontrado" });
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

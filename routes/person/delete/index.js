const express = require("express");
const router = express.Router();

const Person = require("../../../models/Person");

//delete user by id
router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const deletedPerson = await Person.deleteOne({ _id: id });

    if (deletedPerson.deletedCount === 0) {
      return res.status(424).json({ message: "Person not found" });
    }

    res.status(200).json({ message: "Person deleted successfully" });
  } catch (error) {
    res.status(500).json({ isValid: false, error: "Internal server error" });
  }
});

module.exports = router;

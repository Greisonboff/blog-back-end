const express = require("express");
const router = express.Router();

const Person = require("../../../models/Person");
// get all users
router.get("/", async (req, res) => {
  try {
    const people = await Person.find().populate("name", "img", "email");
    res.status(200).json(people);
  } catch (error) {
    res.status(500).json({ isValid: false, error: "Internal server error" });
  }
});

module.exports = router;

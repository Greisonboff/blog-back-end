const express = require("express");
const router = express.Router();

const Person = require("../../../models/Person");
const jwt = require('jsonwebtoken');

//get one user by id
router.get("/id", async (req, res) => {
  const token = req.cookies.token;

  const decodedUserId = token ? jwt.verify(token, process.env.JWT_SECRET) : { id: null };

  try {
    const person = await Person.findOne({ _id: decodedUserId.id });

    if (!person) {
      return res.status(424).json({ message: "Person not found" });
    }

    const data = {
      name: person.name,
      email: person.email,
      img: person.img
    }

    res.status(200).json({ ...data });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

module.exports = router;
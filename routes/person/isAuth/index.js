const express = require("express");
const router = express.Router();

const Person = require("../../../models/Person");
const authMiddleware = require("../../../middleware/authMiddleware");

router.get("/isAuth", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const person = await Person.findOne({ _id: userId });
    res.status(200).json({
      isLoggedIn: true,
      user: {
        name: person.name,
        email: person.email,
        img: person.img,
        avatarColar: person.avatarColar,
      },
    });
  } catch (error) {
    res.status(500).json({ isLoggedIn: false, error: "Internal server error" });
  }
});

module.exports = router;

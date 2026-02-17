const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Person = require("../../../models/Person");
const { generateToken } = require("../../../utils/generateToken");

//login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email)
      return res
        .status(422)
        .json({ isValid: false, error: "email is required" });

    if (!password)
      return res
        .status(422)
        .json({ isValid: false, error: "password is required" });

    const user = await Person.findOne({ email });

    if (!user || !user.password)
      return res
        .status(400)
        .json({ isValid: false, error: "Usuário não encontrado" });

    const valid = await bcrypt.compare(
      password?.toString(),
      user?.password.toString(),
    );

    if (!valid)
      return res.status(401).json({ isValid: false, error: "Senha inválida" });

    const token = generateToken(user._id);

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // HTTPS em produção
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000, // 1 dia
      })
      .status(200)
      .json({
        isValid: true,
        message: "Login successful",
        user: {
          name: user.name,
          email: user.email,
          img: user.img,
          avatarColar: user.avatarColar,
        },
      });
  } catch (error) {
    res.status(500).json({ error: error ? error : "Internal server error" });
  }
});

module.exports = router;

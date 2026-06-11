const router = require("express").Router();
const bcrypt = require("bcrypt");

const Person = require("../../../models/Person");
const { generateToken } = require("../../../utils/generateToken");

//login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email)
      return res
        .status(422)
        .json({ success: false, message: "email is required" });

    if (!password)
      return res
        .status(422)
        .json({ success: false, message: "password is required" });

    const user = await Person.findOne({ email });

    if (!user || !user.password)
      return res
        .status(400)
        .json({ success: false, message: "usuário não encontrado" });

    const valid = await bcrypt.compare(
      password?.toString(),
      user?.password.toString(),
    );

    if (!valid) {
      return res
        .status(401)
        .json({ success: false, message: "senha inválida" });
    }

    const token = generateToken(user._id);

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: true, // HTTPS em produção
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000, // 1 dia
      })
      .status(200)
      .json({
        success: true,
        message: "login efetuado com sucesso",
        user: {
          name: user.name,
          email: user.email,
          img: user.img,
          avatarColar: user.avatarColar,
        },
      });
  } catch (error) {
    console.error("erro ao fazer login:", error);
    res
      .status(500)
      .json({ success: false, message: "erro interno do servidor" });
  }
});

module.exports = router;

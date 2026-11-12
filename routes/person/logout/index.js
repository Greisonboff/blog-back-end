const router = require("express").Router();

router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none", // mesmas opções usadas no login,
  });

  res.status(200).json({ success: true, message: "deslogado com sucesso" });
});

module.exports = router;

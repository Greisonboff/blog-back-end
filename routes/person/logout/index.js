const router = require("express").Router();

router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });

  res.status(200).json({ success: true, message: "deslogado com sucesso" });
});

module.exports = router;

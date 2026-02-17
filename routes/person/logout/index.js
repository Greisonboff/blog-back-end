const router = require("express").Router();

router.post('/logout', (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });

  res
    .status(200)
    .json({ isValid: true, message: "Logout successful" });
});

module.exports = router;
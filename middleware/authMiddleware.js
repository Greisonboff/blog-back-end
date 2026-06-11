const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  try {
    const token = req.cookies.token;

    if (!token)
      return res
        .status(401)
        .json({ success: false, message: "token nao encontrado" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("erro ao verificar token:", err);
    return res.status(403).json({ success: false, message: "token invalido" });
  }
}

module.exports = authMiddleware;

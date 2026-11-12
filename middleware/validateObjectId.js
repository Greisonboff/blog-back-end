const mongoose = require("mongoose");

// Retorna 400 se algum dos parâmetros de rota informados não for um ObjectId válido.
function validateObjectId(...paramNames) {
  return (req, res, next) => {
    const invalid = paramNames.some(
      (name) => !mongoose.isValidObjectId(req.params[name]),
    );

    if (invalid) {
      return res.status(400).json({ success: false, message: "id inválido" });
    }

    next();
  };
}

module.exports = validateObjectId;

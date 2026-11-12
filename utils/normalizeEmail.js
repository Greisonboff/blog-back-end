// Normaliza o e-mail para comparação e armazenamento (sem espaços, minúsculo).
function normalizeEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : email;
}

module.exports = { normalizeEmail };

const Person = require("../models/Person");
const { normalizeEmail } = require("./normalizeEmail");

async function isValidEmail(email) {
  email = normalizeEmail(email);

  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (typeof email !== "string" || !regex.test(email)) {
    return {
      success: false,
      message: "email inválido",
    };
  }

  const emailExists = await Person.findOne({ email });

  if (emailExists) {
    return {
      success: false,
      message: "email ja cadastrado",
    };
  }

  return {
    success: true,
    message: "email valido",
  };
}

module.exports = { isValidEmail };

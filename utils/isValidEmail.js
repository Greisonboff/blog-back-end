const Person = require("../models/Person");

async function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) {
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

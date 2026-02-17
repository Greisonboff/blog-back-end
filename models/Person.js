const mongoose = require("mongoose");

const Person = mongoose.model("Person", {
  name: String,
  img: String,
  avatarColar: String,
  email: String,
  password: String,
});

module.exports = Person;

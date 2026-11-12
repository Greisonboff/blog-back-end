const mongoose = require("mongoose");

const Person = mongoose.model("Person", {
  name: String,
  img: { url: String, public_id: String },
  avatarColar: String,
  email: String,
  password: { type: String, select: false },
});

module.exports = Person;

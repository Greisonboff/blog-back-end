const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

require("dotenv").config();

const app = express();

// Configuração correta do CORS
app.use(
  cors({
    origin: "http://localhost:3000", // origem do seu front-end
    credentials: true, // necessário se usar cookies ou headers de auth
  }),
);

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// routes
app.get("/", (req, res) => {
  res.json({ message: "Hello {g}blog" });
});

const personRoutes = require("./routes/person");
app.use("/person", personRoutes);

const postRoutes = require("./routes/post");
app.use("/post", postRoutes);

const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;

console.log("user", user, "password", password);
mongoose
  .connect(
    `mongodb+srv://${user}:${password}@cluster0.a1jj7bx.mongodb.net/?appName=Cluster0`,
    {},
  )
  .then(() => {
    console.log("Mongoose is connected");
    app.listen(3030, () => {
      console.log("Server is running on port 3030");
    });
  })
  .catch((err) => {
    console.log("erro ao conectar ao mongoose", err);
  });

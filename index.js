const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const dns = require("dns");

require("dotenv").config();

const app = express();

// Configuração correta do CORS
app.use(
  cors({
    origin:
      process.env.CURRENT_SITE_URL ||
      process.env.CURRENT_SITE_URL_NEW ||
      "http://localhost:3000", // origem do seu front-end
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
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

const weeklyRoutes = require("./routes/weekly-save");
app.use("/weekly-save", weeklyRoutes);

// Define servidores DNS globalmente para o Node.js
// Usando Cloudflare (1.1.1.1) e Google DNS (8.8.8.8)
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const database = process.env.DB_NAME;

mongoose
  .connect(
    `mongodb+srv://${user}:${password}@cluster0.a1jj7bx.mongodb.net/${database}?appName=Cluster0`,
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

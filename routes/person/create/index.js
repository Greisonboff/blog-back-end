const express = require("express");
const router = express.Router();
const path = require('path'); // Adicione esta linha

const Person = require("../../../models/Person");
const { hashPassword } = require("../../../utils/hashPassword");
const { isValidEmail } = require("../../../utils/isValidEmail");
const { generateToken } = require("../../../utils/generateToken");

const multer = require('multer');
const upload = multer({
  storage: multer.diskStorage({
    destination: 'public/uploads/userAvatar',
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
      cb(null, true);
    } else {
      cb(new Error('Only .png, .jpg and .jpeg format allowed!'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Create user
router.post("/", upload.single('img'), async (req, res) => {
  try {
    // Extrair campos do formulário
    const { name, email, password, confirmPassword } = req.body;
    const imagePath = req.file ? `/uploads/userAvatar/${req.file.filename}` : null;

    // Validações
    if (!name) return res.status(422).json({ error: "name is required" });
    if (!email) return res.status(422).json({ error: "email is required" });
    if (!isValidEmail(email)) return res.status(422).json({ error: "email is invalid" });
    if (!password) return res.status(422).json({ error: "password is required" });
    if (!confirmPassword) return res.status(422).json({ error: "confirm password is required" });
    if (password !== confirmPassword) return res.status(422).json({ error: "passwords do not match" });

    const hashedPassword = await hashPassword(password);

    const randomColor =
      "#" +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0");

    const person = {
      name,
      email,
      password: hashedPassword,
      img: imagePath,
      avatarColar: randomColor
    };

    const user = await Person.create(person);
    const token = generateToken(user._id);

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .status(201)
      .json({
        isValid: true,
        message: "Person created successfully",
        user: {
          name: user.name,
          email: user.email,
          img: user.img,
          avatarColar: user.avatarColar
        },
      });

  } catch (error) {
    console.error("Error in user creation:", error);
    if (error.message.includes('duplicate key error')) {
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
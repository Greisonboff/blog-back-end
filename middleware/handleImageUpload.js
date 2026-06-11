import { fileTypeFromBuffer } from "file-type";
import { cloudinaryUpload } from "../utils/cloudinaryUpload.js";

export const handleImageUpload = async (req, res, next) => {
  try {
    if (!req.file && !req.files) return next();

    const file = req.file ? req.file : req.files[0];

    if (!file) {
      return next();
    }

    const fileType = await fileTypeFromBuffer(file.buffer);

    if (!fileType || !["image/png", "image/jpeg"].includes(fileType.mime)) {
      return res
        .status(400)
        .json({ success: false, message: "arquivo inválido" });
    }

    const result = await cloudinaryUpload(
      file.buffer,
      req.currentImagePublicId || null,
    );

    // 🔥 passando para frente
    req.uploadedImage = {
      url: result.url,
      public_id: result.public_id,
    };

    next();
  } catch (error) {
    next(error);
  }
};

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

export function cloudinaryUpload(newImage, imagePublicId) {
  return new Promise(async (resolve, reject) => {
    try {
      // 1️⃣ Deleta imagem antiga
      if (imagePublicId) {
        try {
          await cloudinary.uploader.destroy(imagePublicId);
        } catch (err) {
          console.log("Erro ao deletar antiga:", err);
        }
      }

      // 2️⃣ Cria o stream
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "userAvatar",
          public_id: imagePublicId || undefined,
          overwrite: true,
          invalidate: true,
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }

          resolve({
            url: result.secure_url,
            public_id: result.public_id,
          });
        },
      );

      // 3️⃣ Envia o buffer
      stream.end(newImage);
    } catch (error) {
      console.error("Error in cloudinaryUpload:", error);
      reject(error);
    }
  });
}

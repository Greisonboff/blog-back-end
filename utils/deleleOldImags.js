const fs = require("fs");
const path = require("path");
//import { fileURLToPath } from "url";

const dirname = path.dirname("public");

// Função para excluir a imagem antiga
module.exports.deleteOldImage = function deleteOldImage(imagePath) {
  console.log("Caminho da imagem a ser excluída:", imagePath);
  if (!imagePath) {
    console.log("Nenhuma imagem para excluir.");
    return;
  }

  const fullPath = path.join(dirname, "public", imagePath);

  fs.unlink(fullPath, (err) => {
    if (err) {
      console.error("Erro ao excluir imagem antiga:", err);
    } else {
      console.log("Imagem antiga excluída com sucesso.");
    }
  });
};

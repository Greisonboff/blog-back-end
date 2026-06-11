const express = require("express");
const router = express.Router();

const Post = require("../../../models/Post");
const authMiddleware = require("../../../middleware/authMiddleware");

//like
router.patch("/like", authMiddleware, async (req, res) => {
  const { id, likeType } = req.body;

  const userId = req.user.id;

  if (!id || !userId || !likeType) {
    return res
      .status(422)
      .json({ success: false, message: "dados incompletos" });
  }

  try {
    if (likeType === "unlike") {
      await Post.findByIdAndUpdate(id, {
        $pull: { likes: { userId: userId } },
      });
      res
        .status(200)
        .json({ success: true, message: "post discutido com sucesso" });
      return;
    }

    await Post.findByIdAndUpdate(id, {
      $addToSet: { likes: { userId: userId } },
    });
    res
      .status(200)
      .json({ success: true, message: "post curtido com sucesso" });
  } catch (error) {
    console.error("erro ao curtir post:", error);
    res
      .status(500)
      .json({ success: false, message: "erro interno do servidor" });
  }
});

module.exports = router;

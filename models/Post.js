const mongoose = require("mongoose");

const Post = mongoose.model("Post", {
  title: { type: String, required: true },
  description: String,
  category: { type: String },
  comments: [
    {
      comment: { type: String },
      commentedAt: { type: Date, default: Date.now },
      commentId: { type: mongoose.Schema.Types.ObjectId, ref: "Comment" },
      user: { type: mongoose.Schema.Types.ObjectId, ref: "Person" },
    }],
  content: { type: String, required: true },
  images: [{ type: String }],
  likes: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "Person" },
      name: { type: String },
      likedAt: { type: Date, default: Date.now },
    },
  ],
  user: { type: mongoose.Schema.Types.ObjectId, ref: "Person" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = Post;

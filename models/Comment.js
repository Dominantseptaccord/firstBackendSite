const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
    commentText: { type: String, required: true },
    userName: { type: String, required: true },
    direction: { type: String, required: true },
    course: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    score: { type: Number, default: 0 }
});

module.exports = mongoose.model("Comment", CommentSchema);
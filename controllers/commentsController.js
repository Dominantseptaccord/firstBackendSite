const Comment = require("../models/Comment");
const { authenticateToken } = require("../middleware/authenticateToken");

const commentsController = {
    getAllComments: async (req, res) => {
        try {
            const { course } = req.query;
            if (!course) return res.status(400).json({ msg: "Course parameter is required" });
            
            const comments = await Comment.find({ course }).sort({ createdAt: -1 });
            res.status(200).json({ comments });
        } catch (err) {
            console.error(err);
            res.status(500).json({ msg: "Error retrieving comments" });
        }
    },

    createComment: async (req, res) => {
        try {
            const { commentText, course } = req.body;
            if (!course) return res.status(400).json({ msg: "Course is required" });
            
            const newComment = new Comment({
                commentText,
                course,
                userName: req.user.userName,
                direction: req.user.direction || "Unknown",
            });
            
            await newComment.save();
            res.status(201).json({ msg: "Comment saved", comment: newComment });
        } catch (err) {
            console.error(err);
            res.status(500).json({ msg: "Error saving comment" });
        }
    },

    likeComment: async (req, res) => {
        try {
            const comment = await Comment.findById(req.params.id);
            if (!comment) return res.status(404).json({ msg: "Comment not found" });
            
            comment.score += 1;
            await comment.save();
            res.json({ msg: "Comment liked", comment });
        } catch (err) {
            console.error(err);
            res.status(500).json({ msg: "Error liking comment" });
        }
    },

    dislikeComment: async (req, res) => {
        try {
            const comment = await Comment.findById(req.params.id);
            if (!comment) return res.status(404).json({ msg: "Comment not found" });
            
            comment.score -= 1;
            await comment.save();
            res.json({ msg: "Comment disliked", comment });
        } catch (err) {
            console.error(err);
            res.status(500).json({ msg: "Error disliking comment" });
        }
    },
};

module.exports = commentsController;
const express = require("express");
const router = express.Router();
const commentsController = require("../controllers/commentsController");
const { authenticateToken } = require("../middleware/authenticateToken");

router.get("/comments", authenticateToken, commentsController.getAllComments);
router.post("/comments", authenticateToken, commentsController.createComment);
router.post("/comments/:id/like", authenticateToken, commentsController.likeComment);
router.post("/comments/:id/dislike", authenticateToken, commentsController.dislikeComment);

module.exports = router;
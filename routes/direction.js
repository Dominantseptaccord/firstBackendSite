const express = require("express");
const router = express.Router();
const Direction = require("../models/Direction");
const directionController = require("../controllers/directionController");

// User Level

router.post("/direction", directionController.create);
router.get("/directions-with-courses", directionController.getAllWithCourses);
router.get("/direction", directionController.getAll);
router.put("/direction/:id", directionController.updateById);
router.delete("/direction/:id", directionController.deleteById);

module.exports = router;

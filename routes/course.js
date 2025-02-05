const express = require("express");
const router = express.Router();
const courseController = require("../controllers/courseController");


// User Level Courses
router.post("/courses", courseController.createCourse); 
router.get("/courses/:direction_id", courseController.getCoursesByDirection); 
router.put("/courses/:id", courseController.updateCourse); 
router.delete("/courses/:id", courseController.deleteCourse);


module.exports = router;

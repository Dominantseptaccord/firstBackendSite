const Course = require("../models/Course");
const Direction = require("../models/Direction");

const courseController = {
  createCourse: async (req, res) => {
    try {
      const { title, description, direction_id, level } = req.body;

      const direction = await Direction.findOne({ direction_id });
      if (!direction) {
        return res.status(404).json({ msg: "Direction not found" });
      }

      const newCourse = new Course({
        title,
        description,
        direction_id, 
        level
      });

      const savedCourse = await newCourse.save();

      direction.courses.push(savedCourse._id);
      await direction.save();

      res.status(201).json({ msg: "Course created successfully", course: savedCourse });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Unable to create course" });
    }
  },

  getCoursesByDirection: async (req, res) => {
    try {
        const { direction_id } = req.params;

        const courses = await Course.find({ direction_id }); 
        res.status(200).json({ courses });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Unable to fetch courses" });
    }
},


  updateCourse: async (req, res) => {
    try {
      const { id } = req.params;
      const updatedData = req.body;

      const updatedCourse = await Course.findByIdAndUpdate(id, updatedData, { new: true });
      if (!updatedCourse) {
        return res.status(404).json({ msg: "Course not found" });
      }

      res.status(200).json({ msg: "Course updated successfully", course: updatedCourse });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Unable to update course" });
    }
  },

  deleteCourse: async (req, res) => {
    try {
      const { id } = req.params;

      const deletedCourse = await Course.findByIdAndDelete(id);
      if (!deletedCourse) {
        return res.status(404).json({ msg: "Course not found" });
      }

      res.status(200).json({ msg: "Course deleted successfully", course: deletedCourse });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Unable to delete course" });
    }
  },
};

module.exports = courseController;

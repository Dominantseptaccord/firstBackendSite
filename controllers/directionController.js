const Direction = require("../models/Direction");

const directionController = {
  create: async (req, res) => {
    try {
      const { title, description } = req.body;

      const newDirection = new Direction({
        title,
        description,
      });

      const savedDirection = await newDirection.save();
      res.status(201).json({ msg: "Direction successfully created!", data: savedDirection });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Unable to create direction" });
    }
  },

  getAllWithCourses: async (req, res) => {
    try {
      const directions = await Direction.find().populate("courses");
      res.status(200).json({ directions });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Unable to fetch directions with courses" });
    }
  },

  getAll: async (req, res) => {
    try {
      const directions = await Direction.find();
      res.status(200).json({ directions });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Unable to fetch directions" });
    }
  },

  updateById: async (req, res) => {
    try {
      const id = req.params.id;
      const updatedDirection = await Direction.findByIdAndUpdate(id, req.body, { new: true });
      res.status(200).json({ msg: "Direction successfully updated!", data: updatedDirection });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Unable to update direction" });
    }
  },

  deleteById: async (req, res) => {
    try {
      const id = req.params.id;
      const deletedDirection = await Direction.findByIdAndDelete(id);
      res.status(200).json({ msg: "Direction successfully deleted!", data: deletedDirection });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Unable to delete direction" });
    }
  },
};

module.exports = directionController;

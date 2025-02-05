const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  direction_id: { 
    type: String,
    required: true,
  },
  level: {
    type: String,
    enum: ["Kotlin New", "Kotlin Average", "Kotlin Old", "Android Developer"], 
    default: "Kotlin New",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


const Course = mongoose.model("Course", courseSchema);
module.exports = Course;

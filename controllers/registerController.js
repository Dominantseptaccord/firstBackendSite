const Data = require("../models/Data");
const Direction = require("../models/Direction");
const speakeasy = require("speakeasy");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const qrcode = require("qrcode");
const nodemailer = require("nodemailer");
const { activeSessions } = require("../middleware/authenticateToken");


const registerController = {
  register: async (req, res) => {
    try {
      const { userName, emailName, password, direction } = req.body;
      
      const existingUser = await Data.findOne({ emailName });
      if (existingUser) {
        return res.status(400).json({ msg: "User already exists" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);


      const newUser = new Data({
        userName,
        emailName,
        password: hashedPassword,
        direction
      });


      await newUser.save();

      res.status(201).json({ 
        msg: "Registration successful!",
        user: {
          id: newUser._id,
          email: newUser.emailName,
          direction: newUser.direction
        }
      });

    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ msg: "Registration failed" });
    }
  },

  getAllUsers: async (req, res) => {
    try {
      const users = await Data.find({}, { password: 0 });
      res.status(200).json({ users });
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: "Unable to fetch users" });
    }
  },

  getUsersByDirection: async (req, res) => {
    try {
      const groupedUsers = await Data.aggregate([
        {
          $group: {
            _id: "$direction",
            users: { $push: { userName: "$userName", emailName: "$emailName" } },
            count: { $sum: 1 },
          },
        },
      ]);

      res.status(200).json({ data: groupedUsers });
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: "Unable to group users by direction" });
    }
  },

  updateUser: async (req, res) => {
    try {
      const id = req.params.id;
      const updatedData = req.body;

      const updatedUser = await Data.findOneAndUpdate({ _id: id }, updatedData, { new: true });
      res.status(200).json({ msg: "User data successfully updated", data: updatedUser });
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: "Unable to update user data" });
    }
  },

  updateUserDirection: async (req, res) => {
    try {
      const { id } = req.params;
      const { direction } = req.body;

      const updatedUser = await Data.findByIdAndUpdate(id, { direction }, { new: true });

      if (!updatedUser) {
        return res.status(404).json({ msg: "User not found" });
      }

      await Direction.findOneAndUpdate(
        { title: updatedUser.direction },
        { $set: { description: `Updated level for: ${updatedUser.emailName}` } },
        { new: true }
      );

      res.status(200).json({
        msg: "User's direction updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: "Unable to update user's direction" });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const id = req.params.id;
      const deletedUser = await Data.findByIdAndDelete(id);
      res.status(200).json({ msg: "User successfully deleted", data: deletedUser });
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: "Unable to delete user" });
    }
  },
};

module.exports = registerController;

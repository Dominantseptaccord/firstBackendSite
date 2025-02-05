    const express = require("express");
    const router = express.Router();
    const Data = require("../models/Data")
    const Direction = require("../models/Direction");
    const bcrypt = require("bcrypt");
    const qrcode = require("qrcode");
    const speakeasy = require("speakeasy");

    const registerController = require("../controllers/registerController");


    //Registration
    router.post("/register", registerController.register);
    router.get("/register", registerController.getAllUsers);
    router.get("/users_ds", registerController.getUsersByDirection);
    router.put("/register/:id", registerController.updateUser);
    router.put("/register/update-direction/:id", registerController.updateUserDirection);
    router.delete("/register/:id", registerController.deleteUser);
    module.exports = router;
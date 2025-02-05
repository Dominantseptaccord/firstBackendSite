    const express = require("express");
    const router = express.Router();
    const Data = require("../models/Data");
    const bcrypt = require("bcrypt");
    const jwt = require("jsonwebtoken");
    require("dotenv").config();
    const dataController = require("../controllers/dataController");

    router.post("/signin", dataController.signIn);
    router.post("/verify-2fa", dataController.verify2FA);
    router.get("/enable-2fa/:id", dataController.get2FASetup); 
    router.post("/enable-2fa/:id", dataController.enable2FA);
    router.post("/disable-2fa/:id", dataController.disable2FA);
    router.get("/signin", dataController.getAll);
    router.put("/signin/:id", dataController.updateById);
    router.delete("/signin/:id", dataController.deleteById);

    router.post("/register", dataController.register);

    module.exports = router;

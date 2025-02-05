  const Data = require("../models/Data");
  const bcrypt = require("bcrypt");
  const jwt = require("jsonwebtoken");
  const speakeasy = require("speakeasy");
  const QRCode = require("qrcode");
  require("dotenv").config();

  const { activeSessions } = require("../middleware/authenticateToken");
  const dataController = {
    signIn: async (req, res) => {
      try {
        const { emailName, password } = req.body;
        const user = await Data.findOne({ emailName });

        if (!user) return res.status(404).json({ msg: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Invalid password" });
        if (user.twoFactorSecret) {
          const tempToken = jwt.sign(
            { id: user._id, needs2FA: true },
            process.env.JWT_SECRET,
            { expiresIn: "5m" }
          );

          let qrCode = null;
          if (!user.twoFactorEnabled) {
            const otpauthUrl = speakeasy.otpauthURL({
              secret: user.twoFactorSecret,
              label: `MotivationApp (${user.emailName})`,
              issuer: "MotivationApp",
            });
            qrCode = await QRCode.toDataURL(otpauthUrl);
          }

          return res.status(200).json({
            msg: "2FA required",
            tempToken,
            twoFactorRequired: true,
            qrCode, 
            secret: user.twoFactorSecret,
          });
        }

        const token = jwt.sign(
          { id: user._id, emailName: user.emailName },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );

        activeSessions[user._id] = token;
        res.cookie("auth_token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 3600000,
        });

        return res.status(200).json({ msg: "Login successful", token });
      } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ msg: "Unable to login" });
      }
    },

    verify2FA: async (req, res) => {
      try {
        const { code, tempToken } = req.body;
        const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
        const user = await Data.findById(decoded.id);
  
        if (!user) return res.status(404).json({ msg: "User not found" });
  
        const verified = speakeasy.totp.verify({
          secret: user.twoFactorSecret,
          encoding: "base32",
          token: code,
          window: 2
        });
  
        if (!verified) return res.status(400).json({ msg: "Invalid 2FA code" });
  
        const finalToken = jwt.sign(
          { id: user._id, emailName: user.emailName },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );
  
        activeSessions[user._id] = finalToken;
        res.cookie("auth_token", finalToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 3600000
        });
  
        res.status(200).json({ msg: "2FA verification successful", token: finalToken });
      } catch (error) {
        console.error("2FA verification error:", error);
        res.status(500).json({ msg: "Error verifying 2FA code" });
      }
    },
  
    enable2FA: async (req, res) => {
      try {
        const { id } = req.params;
        const { code } = req.body;
        
        const user = await Data.findById(id);
        if (!user || !user.twoFactorTempSecret) {
          return res.status(404).json({ msg: "User or temporary secret not found" });
        }
    
        const verified = speakeasy.totp.verify({
          secret: user.twoFactorTempSecret,
          encoding: "base32",
          token: code,
          window: 2,
        });
    
        if (!verified) {
          return res.status(400).json({ msg: "Invalid 2FA code" });
        }
    
        user.twoFactorSecret = user.twoFactorTempSecret;
        user.twoFactorEnabled = true;
        user.twoFactorTempSecret = null; 
        await user.save();
    
        res.status(200).json({ msg: "2FA enabled successfully" });
      } catch (error) {
        console.error("Enable 2FA error:", error);
        res.status(500).json({ msg: "Error enabling 2FA" });
      }
    },
    get2FASetup: async (req, res) => {
      try {
        const { id } = req.params;
        const user = await Data.findById(id);
        
        if (!user) return res.status(404).json({ msg: "User not found" });

        const secret = speakeasy.generateSecret({ name: `MotivationApp (${user.emailName})` });
        user.twoFactorTempSecret = secret.base32;
        await user.save();
    
        const qrCode = await QRCode.toDataURL(secret.otpauth_url);
    
        return res.status(200).json({
          msg: "2FA setup data",
          qrCode,
          manualEntryCode: secret.base32,
        });
      } catch (error) {
        console.error("2FA setup error:", error);
        res.status(500).json({ msg: "Error getting 2FA setup data" });
      }
    },
  
    disable2FA: async (req, res) => {
      try {
        const { id } = req.params;
        const user = await Data.findById(id);
        if (!user) return res.status(404).json({ msg: "User not found" });
  
        user.twoFactorSecret = null;
        user.twoFactorEnabled = false;
        await user.save();
  
        res.status(200).json({ msg: "2FA disabled successfully" });
      } catch (error) {
        console.error("Disable 2FA error:", error);
        res.status(500).json({ msg: "Error disabling 2FA" });
      }
    },    
    getAll: async (req, res) => {
      try {
        const datas = await Data.find();
        res.status(200).json({ datas });
      } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Unable to get datas" });
      }
    },

    updateById: async (req, res) => {
      try {
        const id = req.params.id;
        const updatedData = req.body;
        const updatedUser = await Data.findByIdAndUpdate(id, updatedData, { new: true });
        res.status(200).json({ msg: "Data successfully updated", data: updatedUser });
      } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Unable to update the data" });
      }
    },

    deleteById: async (req, res) => {
      try {
        const id = req.params.id;
        const deletedUser = await Data.findByIdAndDelete(id);
        res.status(200).json({ msg: "Data successfully deleted", data: deletedUser });
      } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Unable to delete the data" });
      }
    },

    register: async (req, res) => {
      try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const newUser = new Data({
          userName: req.body.userName,
          emailName: req.body.emailName,
          password: hashedPassword,
          direction: req.body.direction,
        });

        const savedUser = await newUser.save();
        res.locals.userName = savedUser.userName;
        res.locals.userLevel = savedUser.level;
        res.redirect("/education");
      } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Unable to register user" });
      }
    },
  };

  module.exports = dataController;

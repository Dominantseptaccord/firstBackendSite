require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const cookieParser = require("cookie-parser");
const { authenticateToken } = require("./middleware/authenticateToken");

const app = express();
const authRoutes = require('./routes/authRoutes');

// Middleware
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
let otpStorage = {};
// Connection to MongoDB
const connectToDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB!");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
connectToDb();

// Routes
const directionRoutes = require("./routes/Direction");
const registerRoutes = require("./routes/register");
const loginRoutes = require("./routes/Data");
const courseRoutes = require("./routes/course");

app.use("/api", directionRoutes);
app.use("/api", registerRoutes);
app.use("/api", loginRoutes);
app.use("/api", courseRoutes);

app.set("view engine", "ejs");

app.get("/education", authenticateToken, (req, res) => {
  const userName = req.user.userName;
  const userLevel = req.user.level || "Beginner";
  res.render("education", { userName, userLevel });
});

app.get("/signin", (req, res) => {
  res.render("signin");
});

app.get("/course", (req, res) => {
  res.render("course");
});

app.get("/check", authenticateToken, (req, res) => { 
   console.log("User in /check:", req.user); 
  res.render('check', { 
    user: req.user 
  });
});
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/check-user", (req, res) => {
  const { emailName: username, password } = req.body;
  if (!password) {
    console.error("Error: Password is empty");
  } else {
    console.log(`Email: ${username}\nPassword: ${password}`);
    res.redirect("/education");
  }
});

// Start the server
const PORT = 5500;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});



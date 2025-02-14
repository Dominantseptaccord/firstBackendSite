require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { authenticateToken } = require("./middleware/authenticateToken");

const app = express();
const authRoutes = require('./routes/authRoutes');
app.use(cors({
  origin: 'http://localhost:5500',
  credentials: true
}));
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
const directionRoutes = require("./routes/direction");
const registerRoutes = require("./routes/register");
const loginRoutes = require("./routes/Data");
const courseRoutes = require("./routes/course");
const commentsRoutes = require("./routes/comments");
const compilerRoutes = require('./routes/compiler');

app.use("/api", directionRoutes);
app.use("/api", registerRoutes);
app.use("/api", loginRoutes);
app.use("/api", courseRoutes);
app.use("/api", commentsRoutes);
app.use('/api', compilerRoutes);

app.set("view engine", "ejs");

app.get("/education", authenticateToken, (req, res) => {
  const userName = req.user.userName;
  const userLevel = req.user.level || "Beginner";
  res.render("education", { userName, userLevel });
});

app.get("/signin", (req, res) => {
  res.render("signin");
});

app.get("/course", authenticateToken, (req, res) => {
  res.render("course", { userName: req.user.userName });
});
app.get("/course-syntax", authenticateToken, (req, res) => {
  res.render("course-syntax", { userName: req.user.userName });
});
app.get("/android-development", authenticateToken, (req, res) => {
  res.render("android-development", { userName: req.user.userName });
});

app.get("/check", authenticateToken, (req, res) => { 
   console.log("User in /check:", req.user); 
  res.render('check', { 
    user: req.user 
  });
});
app.get("/", (req, res) => {
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
// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).render('error', {
      statusCode,
      message,
      error: process.env.NODE_ENV === 'development' ? err : {}
  });
});
// 404 Handler
app.use((req, res) => {
  res.status(404).render('error', {
      statusCode: 404,
      message: 'Page Not Found'
  });
});
// Start the server
const PORT = 5500;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});



require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const expressLayouts = require('express-ejs-layouts');

const app = express();

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// MongoDB Setup
mongoose.connect(process.env.MONGO_URI, {})
  .then(() => console.log("MongoDB Connected..."))
  .catch(err => console.log("Failed to Connect:", err));

// Middleware
app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("layout", "layouts/main");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/public', express.static('public'));

// Route for login page
app.get("/", (req, res) => {
  res.render('auth/login', {
    pageTitle: 'Login',
    customStylesheet: './public/css/login.css'
  })
});

// Optional 404 Handler
app.use((req, res) => {
  res.status(404).send("Page Not Found");
});

// Optional Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

// Start Server
app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
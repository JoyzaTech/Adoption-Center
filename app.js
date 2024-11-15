// Load environment variables first
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const expressLayouts = require("express-ejs-layouts");
const bcrypt = require("bcrypt");
const session = require("express-session");
const User = require("./models/User");
const faker = require('@faker-js/faker');

const app = express();

const pets = [
  { name: "Buddy", age: "2 years", gender: "Male", image: "https://placecats.com/millie_neo/300/200" },
  { name: "Mittens", age: "3 years", gender: "Female", image: "https://placecats.com/neo_banana/300/200" },
  { name: "Charlie", age: "1 year", gender: "Male", image: "https://placecats.com/neo_2/300/200" },
  { name: "Luna", age: "4 years", gender: "Female", image: "https://placecats.com/bella/300/200" },
];
// Validate essential environment variables
if (!process.env.MONGO_URI) {
  console.error("ERROR: MONGO_URI is not defined in environment variables!");
  console.log("Please create a .env file with your MongoDB connection string.");
  console.log("Example: MONGO_URI=mongodb://localhost:27017/your_database");
  process.exit(1);
}

// MongoDB Setup with better error handling
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✓ MongoDB Connected Successfully");
  })
  .catch((err) => {
    console.error("✗ MongoDB Connection Error:");
    console.error(err);
    process.exit(1);
  });

// Validate Cloudinary credentials
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.warn("WARNING: Cloudinary credentials are not fully configured in environment variables!");
}

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Middleware
app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("layout", "layouts/main");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/public", express.static("public"));
app.use(express.static('public'));
// Session configuration with better security
const ONE_DAY = 1000 * 60 * 60 * 24;
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'yK9nt2x#mP5vL8$qR3jH', // Default secure secret, but better to use env variable
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: ONE_DAY,
      sameSite: 'strict'
    }
  })
);

// Route for login page (GET request)
app.get("/", (req, res) => {
  if (req.session.userId) {
    return res.redirect("/home");
  }
  res.render("auth/login", {
    pageTitle: "Login",
    customStylesheet: "./public/css/login.css",
    error: null,
  });
});

// Improved login route with rate limiting
const loginAttempts = new Map();

app.post("/login", async (req, res) => {
  console.log("Received login request");

  const { username, password } = req.body;
  const ip = req.ip;
  
  // Simple rate limiting
  if (loginAttempts.get(ip) >= 5) {
    return res.render("auth/login", {
      pageTitle: "Login",
      customStylesheet: "./public/css/login.css",
      error: "Too many login attempts. Please try again later.",
    });
  }

  if (!username?.trim() || !password?.trim()) {
    return res.render("auth/login", {
      pageTitle: "Login",
      customStylesheet: "./public/css/login.css",
      error: "Please provide both username/email and password",
    });
  }

  try {
    const query = username.includes("@") 
      ? { email: username.trim().toLowerCase() } 
      : { username: username.trim().toLowerCase() };
    
    const user = await User.findOne(query);
    
    if (!user) {
      loginAttempts.set(ip, (loginAttempts.get(ip) || 0) + 1);
      return res.render("auth/login", {
        pageTitle: "Login",
        customStylesheet: "./public/css/login.css",
        error: "Invalid username or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      loginAttempts.set(ip, (loginAttempts.get(ip) || 0) + 1);
      return res.render("auth/login", {
        pageTitle: "Login",
        customStylesheet: "./public/css/login.css",
        error: "Invalid username or password",
      });
    }

    // Reset login attempts on successful login
    loginAttempts.delete(ip);
    
    // Set session
    req.session.userId = user._id;
    req.session.username = user.username;
    
    return res.redirect("/home");

  } catch (error) {
    console.error("Login error:", error);
    res.render("auth/login", {
      pageTitle: "Login",
      customStylesheet: "./public/css/login.css",
      error: "An error occurred. Please try again.",
    });
  }
});

// Route for signup page (GET request)
app.get("/register", (req, res) => {
  if (req.session.userId) {
    return res.redirect("/dashboard");
  }
  res.render("auth/register", {
    pageTitle: "Register",
    customStylesheet: "./public/css/register.css",
    error: null,
  });
});

// Registration route
app.post("/register", async (req, res) => {
  console.log('\n=== Registration Attempt ===');
  console.log('Raw request body:', req.body);
  
  const { username, email, password, 'confirm-password': confirmPassword } = req.body;
  
  console.log('Processed input:');
  console.log('- Username:', username);
  console.log('- Email:', email);
  console.log('- Password length:', password?.length);
  console.log('- Confirm password length:', confirmPassword?.length);

  try {
    // Input validation
    if (!username?.trim() || !email?.trim() || !password?.trim() || !confirmPassword?.trim()) {
      console.log('❌ Registration failed: Missing required fields');
      return res.render("auth/register", {
        pageTitle: "Register",
        customStylesheet: "./public/css/register.css",
        error: "Please fill out all fields.",
      });
    }

    // Validate username length
    if (username.trim().length < 3) {
      console.log('❌ Registration failed: Username too short');
      return res.render("auth/register", {
        pageTitle: "Register",
        customStylesheet: "./public/css/register.css",
        error: "Username must be at least 3 characters long.",
      });
    }

    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email.trim())) {
      console.log('❌ Registration failed: Invalid email format');
      return res.render("auth/register", {
        pageTitle: "Register",
        customStylesheet: "./public/css/register.css",
        error: "Please enter a valid email address.",
      });
    }

    // Validate password length
    if (password.length < 8) {
      console.log('❌ Registration failed: Password too short');
      return res.render("auth/register", {
        pageTitle: "Register",
        customStylesheet: "./public/css/register.css",
        error: "Password must be at least 8 characters long.",
      });
    }

    // Check password match
    if (password !== confirmPassword) {
      console.log('❌ Registration failed: Passwords do not match');
      return res.render("auth/register", {
        pageTitle: "Register",
        customStylesheet: "./public/css/register.css",
        error: "Passwords do not match",
      });
    }

    // Check for existing user
    console.log('Checking for existing user...');
    const existingUser = await User.findOne({ 
      $or: [
        { username: username.trim().toLowerCase() }, 
        { email: email.trim().toLowerCase() }
      ] 
    });

    if (existingUser) {
      console.log('❌ Registration failed: User already exists');
      console.log('Existing user details:', {
        username: existingUser.username,
        email: existingUser.email
      });
      return res.render("auth/register", {
        pageTitle: "Register",
        customStylesheet: "./public/css/register.css",
        error: "Username or email already taken",
      });
    }

    // Hash password
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');

    // Create new user
    console.log('Creating new user...');
    const newUser = new User({
      username: username.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      password: hashedPassword
    });
    
    console.log('Attempting to save user to database...');
    const savedUser = await newUser.save();
    console.log('✓ User saved successfully:', {
      id: savedUser._id,
      username: savedUser.username,
      email: savedUser.email,
      passwordLength: savedUser.password.length
    });
    
    console.log('✓ Registration successful - redirecting to login');
    res.redirect("/");

  } catch (error) {
    console.error('\n=== Registration Error ===');
    console.error('Error details:', error);
    
    if (error.name === 'ValidationError') {
      console.log('Mongoose validation error:', error.message);
      const errorMessage = Object.values(error.errors).map(err => err.message).join('. ');
      return res.render("auth/register", {
        pageTitle: "Register",
        customStylesheet: "./public/css/register.css",
        error: errorMessage
      });
    }

    if (error.code === 11000) {
      console.log('MongoDB duplicate key error');
      return res.render("auth/register", {
        pageTitle: "Register",
        customStylesheet: "./public/css/register.css",
        error: "Username or email already exists"
      });
    }

    res.render("auth/register", {
      pageTitle: "Register",
      customStylesheet: "./public/css/register.css",
      error: "An error occurred. Please try again.",
    });
  }
});

// Login route with detailed logging
app.post("/login", async (req, res) => {
  console.log('\n=== Login Attempt ===');
  console.log('Raw request body:', req.body);
  
  const { username, password } = req.body;
  const ip = req.ip;
  
  console.log('Login attempt details:');
  console.log('- Username/Email:', username);
  console.log('- Password length:', password?.length);
  console.log('- IP Address:', ip);
  
  // Rate limiting check
  if (loginAttempts.get(ip) >= 5) {
    console.log('❌ Login failed: Too many attempts from IP:', ip);
    return res.render("views/auth/login", {
      pageTitle: "Login",
      customStylesheet: "./public/css/login.css",
      error: "Too many login attempts. Please try again later.",
    });
  }

  if (!username?.trim() || !password?.trim()) {
    console.log('❌ Login failed: Missing credentials');
    return res.render("auth/login", {
      pageTitle: "Login",
      customStylesheet: "./public/css/login.css",
      error: "Please provide both username/email and password",
    });
  }

  try {
    const query = username.includes("@") 
      ? { email: username.trim().toLowerCase() } 
      : { username: username.trim().toLowerCase() };
    
    console.log('Searching for user with query:', query);
    const user = await User.findOne(query);
    
    if (!user) {
      console.log('❌ Login failed: User not found');
      loginAttempts.set(ip, (loginAttempts.get(ip) || 0) + 1);
      return res.render("auth/login", {
        pageTitle: "Login",
        customStylesheet: "./public/css/login.css",
        error: "Invalid username or password",
      });
    }

    console.log('User found:', {
      id: user._id,
      username: user.username,
      email: user.email,
      storedPasswordLength: user.password.length
    });

    console.log('Comparing passwords...');
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match result:', isMatch);

    if (!isMatch) {
      console.log('❌ Login failed: Password mismatch');
      loginAttempts.set(ip, (loginAttempts.get(ip) || 0) + 1);
      return res.render("auth/login", {
        pageTitle: "Login",
        customStylesheet: "./public/css/login.css",
        error: "Invalid username or password",
      });
    }

    // Reset login attempts on successful login
    console.log('Resetting login attempts for IP:', ip);
    loginAttempts.delete(ip);
    
    // Set session
    req.session.userId = user._id;
    req.session.username = user.username;
    
    console.log('✓ Login successful:', {
      userId: user._id,
      username: user.username
    });
    
    return res.redirect("/dashboard");

  } catch (error) {
    console.error('\n=== Login Error ===');
    console.error('Error details:', error);
    res.render("auth/login", {
      pageTitle: "Login",
      customStylesheet: "./public/css/login.css",
      error: "An error occurred. Please try again.",
    });
  }
});
// Logout route
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
    }
    res.redirect("/");
  });
});

app.use(express.static('public'));

// Protected home route
app.get("/home" || "/dashboard", (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/");
  }
  res.render("home", { 
    pageTitle: "Home",
    username: req.session.username,
    customStylesheet: "./public/css/home.css"
  });
});

app.get("/contact", (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/");
  }
  res.render("contact", { 
    pageTitle: "Contact Us",
    username: req.session.username,
    customStylesheet: "./public/css/contact.css"
  });
});

// Ensure you have this middleware set up to serve static files


// Route for surrender page
app.get("/pets/surrender", (req, res) => {
  res.render("pets/surrender", { 
    pageTitle: "Surrender a Pet",
    username: req.session?.username || "Guest", // Provide a fallback for username
    customStylesheet: "/css/test.css" // Use an absolute path for the stylesheet
  });
});
app.get("/pets/browse", (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/");
  }
  res.render("pets/browse", {
    pets: pets,
    pageTitle: "Browse Pets",
    username: req.session.username,
    customStylesheet: "/css/browse.css"
  });
});

// 404 Handler
// app.use((req, res) => {
//   res.status(404).render("404", { 
//       pageTitle: "Page Not Found",
//       customStylesheet: "/public/css/error.css" 
//   });
// });

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).render("error", { 
      pageTitle: "Error",
      customStylesheet: "/public/css/error.css",
      error: process.env.NODE_ENV === 'production' 
          ? "Something went wrong!" 
          : err.message
  });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
});
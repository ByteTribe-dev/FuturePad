const express = require("express");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const rateLimit = require("express-rate-limit");
const User = require("../models/User");
const logger = require("../config/logger");

const router = express.Router();

// Rate limiter for authentication endpoints - stricter limits
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: "Too many authentication attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Password strength validator
const passwordValidator = body("password")
  .isLength({ min: 8 })
  .withMessage("Password must be at least 8 characters long")
  .matches(/[a-z]/)
  .withMessage("Password must contain at least one lowercase letter")
  .matches(/[A-Z]/)
  .withMessage("Password must contain at least one uppercase letter")
  .matches(/[0-9]/)
  .withMessage("Password must contain at least one number")
  .matches(/[@$!%*?&#]/)
  .withMessage("Password must contain at least one special character (@$!%*?&#)");

// Register
router.post(
  "/register",
  authLimiter,
  [
    body("email")
      .isEmail()
      .withMessage("Please provide a valid email address")
      .normalizeEmail(),
    passwordValidator,
    body("name")
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Name must be between 2 and 50 characters")
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage("Name can only contain letters and spaces"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        logger.warn("Registration validation failed", { errors: errors.array() });
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array()
        });
      }

      const { email, password, name } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        logger.warn("Registration attempt with existing email", { email });
        return res.status(400).json({
          success: false,
          message: "User with this email already exists"
        });
      }

      // Split name into firstName and lastName
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Create new user
      const user = new User({
        email,
        password,
        name: name.trim(),
        firstName,
        lastName
      });
      await user.save();

      logger.info("New user registered", { userId: user._id, email: user.email });

      // Generate JWT token with shorter expiry
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.status(201).json({
        success: true,
        message: "User created successfully",
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImage: user.profileImage,
        },
      });
    } catch (error) {
      logger.error("Registration error", { error: error.message, stack: error.stack });
      res.status(500).json({
        success: false,
        message: "Server error during registration"
      });
    }
  }
);

// Login
router.post(
  "/login",
  authLimiter,
  [
    body("email")
      .isEmail()
      .withMessage("Please provide a valid email address")
      .normalizeEmail(),
    body("password")
      .exists()
      .withMessage("Password is required")
      .notEmpty()
      .withMessage("Password cannot be empty"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        logger.warn("Login validation failed", { errors: errors.array() });
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array()
        });
      }

      const { email, password } = req.body;

      // Find user and explicitly select password
      const user = await User.findOne({ email }).select("+password");
      if (!user) {
        logger.warn("Login attempt with non-existent email", { email });
        return res.status(401).json({
          success: false,
          message: "Invalid credentials"
        });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        logger.warn("Login attempt with incorrect password", { email });
        return res.status(401).json({
          success: false,
          message: "Invalid credentials"
        });
      }

      logger.info("User logged in successfully", { userId: user._id, email: user.email });

      // Generate JWT token with shorter expiry
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.json({
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImage: user.profileImage,
        },
      });
    } catch (error) {
      logger.error("Login error", { error: error.message, stack: error.stack });
      res.status(500).json({
        success: false,
        message: "Server error during login"
      });
    }
  }
);

module.exports = router;

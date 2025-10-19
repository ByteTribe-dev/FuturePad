const express = require("express");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const auth = require("../middleware/auth");
const logger = require("../config/logger");

const router = express.Router();

// Get user profile
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
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
    logger.error("Get profile error", { error: error.message });
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// Update user profile
router.put(
  "/",
  auth,
  [
    body("name")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Name must be between 2 and 50 characters"),
    body("firstName")
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage("First name must be less than 50 characters"),
    body("lastName")
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage("Last name must be less than 50 characters"),
    body("profileImage")
      .optional()
      .isString()
      .withMessage("Profile image must be a valid string"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        logger.warn("Profile update validation failed", { errors: errors.array() });
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array()
        });
      }

      const { name, firstName, lastName, profileImage } = req.body;

      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      // Update fields if provided
      if (name !== undefined) user.name = name;
      if (firstName !== undefined) user.firstName = firstName;
      if (lastName !== undefined) user.lastName = lastName;
      if (profileImage !== undefined) user.profileImage = profileImage;

      await user.save();

      logger.info("User profile updated", { userId: user._id });

      res.json({
        success: true,
        message: "Profile updated successfully",
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
      logger.error("Profile update error", { error: error.message });
      res.status(500).json({
        success: false,
        message: "Server error during profile update"
      });
    }
  }
);

module.exports = router;

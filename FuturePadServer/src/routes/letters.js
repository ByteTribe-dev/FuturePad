const express = require("express");
const { body, validationResult } = require("express-validator");
const Letter = require("../models/Letter");
const auth = require("../middleware/auth");
const logger = require("../config/logger");
const {
  upload,
  deleteImage,
  getPublicIdFromUrl,
} = require("../config/cloudinary");

const router = express.Router();

// Valid mood values
const VALID_MOODS = ["happy", "sad", "excited", "anxious", "grateful", "reflective", "calm", "refresh"];

// Get all letters for authenticated user (excluding soft-deleted)
router.get("/", auth, async (req, res) => {
  try {
    const letters = await Letter.find({
      userId: req.userId,
      isDeleted: { $ne: true },
    }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      count: letters.length,
      letters
    });
  } catch (error) {
    logger.error("Error fetching letters", { error: error.message, userId: req.userId });
    res.status(500).json({
      success: false,
      message: "Failed to fetch letters"
    });
  }
});

// Get single letter (excluding soft-deleted)
router.get("/:id", auth, async (req, res) => {
  try {
    // Validate ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid letter ID format"
      });
    }

    const letter = await Letter.findOne({
      _id: req.params.id,
      userId: req.userId,
      isDeleted: { $ne: true },
    });

    if (!letter) {
      return res.status(404).json({
        success: false,
        message: "Letter not found"
      });
    }

    res.json({
      success: true,
      letter
    });
  } catch (error) {
    logger.error("Error fetching letter", { error: error.message, letterId: req.params.id });
    res.status(500).json({
      success: false,
      message: "Failed to fetch letter"
    });
  }
});

// Create new letter with optional images
router.post("/", [auth, upload.array("images", 5)], async (req, res) => {
  try {
    const { title, content, deliveryDate, mood } = req.body;

    // Validate required fields
    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Title is required"
      });
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Content is required"
      });
    }

    if (!deliveryDate) {
      return res.status(400).json({
        success: false,
        message: "Delivery date is required"
      });
    }

    // Validate title length
    if (title.trim().length > 200) {
      return res.status(400).json({
        success: false,
        message: "Title must be less than 200 characters"
      });
    }

    // Validate content length
    if (content.trim().length > 10000) {
      return res.status(400).json({
        success: false,
        message: "Content must be less than 10,000 characters"
      });
    }

    // Validate delivery date
    const parsedDate = new Date(deliveryDate);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid delivery date format"
      });
    }

    // Validate mood if provided
    if (mood && !VALID_MOODS.includes(mood.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid mood value. Must be one of: ${VALID_MOODS.join(", ")}`
      });
    }

    // Process uploaded images
    const images = [];
    let featuredImage = null;

    if (req.files && req.files.length > 0) {
      logger.info(`Processing ${req.files.length} images for new letter`, { userId: req.userId });

      for (let index = 0; index < req.files.length; index++) {
        const file = req.files[index];

        // Validate Cloudinary data
        if (!file.path || !file.filename) {
          logger.error("Missing Cloudinary data for uploaded file", { index, filename: file.originalname });
          continue;
        }

        const imageData = {
          url: file.path,
          publicId: file.filename,
          caption: req.body[`imageCaption${index}`] || "",
        };
        images.push(imageData);

        // Set first image as featured image
        if (index === 0) {
          featuredImage = {
            url: imageData.url,
            publicId: imageData.publicId,
          };
        }
      }

      logger.info(`Successfully processed ${images.length} images`, { userId: req.userId });
    }

    const letter = new Letter({
      userId: req.userId,
      title: title.trim(),
      content: content.trim(),
      deliveryDate: parsedDate,
      mood: mood ? mood.toLowerCase() : "reflective",
      images,
      featuredImage,
    });

    await letter.save();

    logger.info("Letter created successfully", { letterId: letter._id, userId: req.userId });

    res.status(201).json({
      success: true,
      message: "Letter created successfully",
      letter
    });
  } catch (error) {
    logger.error("Error creating letter", { error: error.message, stack: error.stack });

    // Clean up uploaded images if letter creation fails
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        if (file.filename) {
          try {
            await deleteImage(file.filename);
            logger.info("Cleaned up orphaned image", { publicId: file.filename });
          } catch (cleanupError) {
            logger.error("Failed to cleanup orphaned image", { publicId: file.filename, error: cleanupError.message });
          }
        }
      }
    }

    res.status(500).json({
      success: false,
      message: "Failed to create letter"
    });
  }
});

// Update letter
router.put(
  "/:id",
  [
    auth,
    body("title")
      .optional()
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage("Title must be between 1 and 200 characters"),
    body("content")
      .optional()
      .trim()
      .isLength({ min: 1, max: 10000 })
      .withMessage("Content must be between 1 and 10,000 characters"),
    body("deliveryDate")
      .optional()
      .isISO8601()
      .withMessage("Invalid date format"),
    body("mood")
      .optional()
      .isIn(VALID_MOODS)
      .withMessage(`Invalid mood. Must be one of: ${VALID_MOODS.join(", ")}`),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array()
        });
      }

      // Validate ObjectId format
      if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
          success: false,
          message: "Invalid letter ID format"
        });
      }

      // Check if at least one field is being updated
      if (Object.keys(req.body).length === 0) {
        return res.status(400).json({
          success: false,
          message: "No fields provided for update"
        });
      }

      // Sanitize update data
      const updateData = {};
      if (req.body.title) updateData.title = req.body.title.trim();
      if (req.body.content) updateData.content = req.body.content.trim();
      if (req.body.deliveryDate) updateData.deliveryDate = new Date(req.body.deliveryDate);
      if (req.body.mood) updateData.mood = req.body.mood.toLowerCase();

      const letter = await Letter.findOneAndUpdate(
        { _id: req.params.id, userId: req.userId, isDeleted: { $ne: true } },
        updateData,
        { new: true, runValidators: true }
      );

      if (!letter) {
        return res.status(404).json({
          success: false,
          message: "Letter not found"
        });
      }

      logger.info("Letter updated successfully", { letterId: letter._id, userId: req.userId });

      res.json({
        success: true,
        message: "Letter updated successfully",
        letter
      });
    } catch (error) {
      logger.error("Error updating letter", { error: error.message, letterId: req.params.id });
      res.status(500).json({
        success: false,
        message: "Failed to update letter"
      });
    }
  }
);

// Soft delete letter (mark as deleted)
router.delete("/:id", auth, async (req, res) => {
  try {
    // Validate ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid letter ID format"
      });
    }

    const letter = await Letter.findOne({
      _id: req.params.id,
      userId: req.userId,
      isDeleted: { $ne: true },
    });

    if (!letter) {
      return res.status(404).json({
        success: false,
        message: "Letter not found"
      });
    }

    letter.isDeleted = true;
    letter.deletedAt = new Date();
    await letter.save();

    logger.info("Letter soft-deleted", { letterId: letter._id, userId: req.userId });

    res.json({
      success: true,
      message: "Letter deleted successfully"
    });
  } catch (error) {
    logger.error("Error deleting letter", { error: error.message, letterId: req.params.id });
    res.status(500).json({
      success: false,
      message: "Failed to delete letter"
    });
  }
});

// Hard delete letter (permanent deletion with image cleanup)
router.delete("/:id/permanent", auth, async (req, res) => {
  try {
    // Validate ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid letter ID format"
      });
    }

    const letter = await Letter.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!letter) {
      return res.status(404).json({
        success: false,
        message: "Letter not found"
      });
    }

    // Delete images from Cloudinary - collect failures
    const imageDeleteFailures = [];
    if (letter.images && letter.images.length > 0) {
      for (const image of letter.images) {
        try {
          await deleteImage(image.publicId);
          logger.info("Image deleted from Cloudinary", { publicId: image.publicId });
        } catch (error) {
          logger.error("Failed to delete image from Cloudinary", { publicId: image.publicId, error: error.message });
          imageDeleteFailures.push(image.publicId);
        }
      }
    }

    // Permanently delete the letter
    await Letter.findByIdAndDelete(req.params.id);

    logger.info("Letter permanently deleted", { letterId: req.params.id, userId: req.userId, imageFailures: imageDeleteFailures.length });

    res.json({
      success: true,
      message: "Letter permanently deleted",
      ...(imageDeleteFailures.length > 0 && {
        warning: `${imageDeleteFailures.length} image(s) could not be deleted from storage`
      })
    });
  } catch (error) {
    logger.error("Error permanently deleting letter", { error: error.message, letterId: req.params.id });
    res.status(500).json({
      success: false,
      message: "Failed to permanently delete letter"
    });
  }
});

// Restore soft-deleted letter
router.patch("/:id/restore", auth, async (req, res) => {
  try {
    // Validate ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid letter ID format"
      });
    }

    const letter = await Letter.findOne({
      _id: req.params.id,
      userId: req.userId,
      isDeleted: true,
    });

    if (!letter) {
      return res.status(404).json({
        success: false,
        message: "Deleted letter not found"
      });
    }

    letter.isDeleted = false;
    letter.deletedAt = undefined;
    await letter.save();

    logger.info("Letter restored", { letterId: letter._id, userId: req.userId });

    res.json({
      success: true,
      message: "Letter restored successfully",
      letter
    });
  } catch (error) {
    logger.error("Error restoring letter", { error: error.message, letterId: req.params.id });
    res.status(500).json({
      success: false,
      message: "Failed to restore letter"
    });
  }
});

// Get soft-deleted letters (trash/recycle bin)
router.get("/trash/all", auth, async (req, res) => {
  try {
    const deletedLetters = await Letter.find({
      userId: req.userId,
      isDeleted: true,
    }).sort({
      deletedAt: -1,
    });

    res.json({
      success: true,
      count: deletedLetters.length,
      letters: deletedLetters
    });
  } catch (error) {
    logger.error("Error fetching deleted letters", { error: error.message, userId: req.userId });
    res.status(500).json({
      success: false,
      message: "Failed to fetch deleted letters"
    });
  }
});

// Delete specific image from letter
router.delete("/:id/images/:imageIndex", auth, async (req, res) => {
  try {
    // Validate ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid letter ID format"
      });
    }

    const letter = await Letter.findOne({
      _id: req.params.id,
      userId: req.userId,
      isDeleted: { $ne: true },
    });

    if (!letter) {
      return res.status(404).json({
        success: false,
        message: "Letter not found"
      });
    }

    const imageIndex = parseInt(req.params.imageIndex);
    if (isNaN(imageIndex) || imageIndex < 0 || imageIndex >= letter.images.length) {
      return res.status(400).json({
        success: false,
        message: "Invalid image index"
      });
    }

    const imageToDelete = letter.images[imageIndex];

    // Delete image from Cloudinary
    try {
      await deleteImage(imageToDelete.publicId);
      logger.info("Image deleted from letter", { publicId: imageToDelete.publicId, letterId: letter._id });
    } catch (error) {
      logger.error("Failed to delete image from Cloudinary", { publicId: imageToDelete.publicId, error: error.message });
      // Continue anyway to remove from database
    }

    // Remove image from letter
    letter.images.splice(imageIndex, 1);

    // Update featured image if it was the deleted one
    if (
      letter.featuredImage &&
      letter.featuredImage.publicId === imageToDelete.publicId
    ) {
      letter.featuredImage =
        letter.images.length > 0
          ? {
              url: letter.images[0].url,
              publicId: letter.images[0].publicId,
            }
          : null;
    }

    await letter.save();

    res.json({
      success: true,
      message: "Image deleted successfully",
      letter
    });
  } catch (error) {
    logger.error("Error deleting image from letter", { error: error.message, letterId: req.params.id });
    res.status(500).json({
      success: false,
      message: "Failed to delete image"
    });
  }
});

module.exports = router;

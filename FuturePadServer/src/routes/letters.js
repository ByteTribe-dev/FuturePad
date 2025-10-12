const express = require("express");
const { body, validationResult } = require("express-validator");
const Letter = require("../models/Letter");
const auth = require("../middleware/auth");
const {
  upload,
  deleteImage,
  getPublicIdFromUrl,
} = require("../config/cloudinary");

const router = express.Router();

// Get all letters for authenticated user (excluding soft-deleted)
router.get("/", auth, async (req, res) => {
  try {
    const letters = await Letter.find({
      userId: req.userId,
      isDeleted: { $ne: true }, // Exclude soft-deleted letters
    }).sort({
      createdAt: -1,
    });
    res.json(letters);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get single letter (excluding soft-deleted)
router.get("/:id", auth, async (req, res) => {
  try {
    const letter = await Letter.findOne({
      _id: req.params.id,
      userId: req.userId,
      isDeleted: { $ne: true }, // Exclude soft-deleted letters
    });

    if (!letter) {
      return res.status(404).json({ message: "Letter not found" });
    }

    res.json(letter);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create new letter with optional images
router.post("/", [auth, upload.array("images", 5)], async (req, res) => {
  try {
    // Manual validation since we're using multipart/form-data
    const { title, content, deliveryDate, mood } = req.body;

    console.log("📝 Request body:", req.body);
    console.log("📸 Request files:", req.files);
    console.log("📸 Files length:", req.files ? req.files.length : 0);

    if (!title || !content || !deliveryDate) {
      return res.status(400).json({
        message: "Title, content, and delivery date are required",
      });
    }

    // Validate mood if provided
    const validMoods = [
      "happy",
      "sad",
      "excited",
      "anxious",
      "grateful",
      "reflective",
    ];
    if (mood && !validMoods.includes(mood)) {
      return res.status(400).json({
        message: "Invalid mood value",
      });
    }

    // Process uploaded images
    const images = [];
    let featuredImage = null;

    console.log("🔍 Processing images...");
    if (req.files && req.files.length > 0) {
      console.log("✅ Files found, processing...");
      req.files.forEach((file, index) => {
        console.log(`📸 Processing file ${index}:`, {
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          path: file.path,
          filename: file.filename,
        });

        // Validate that we have the required Cloudinary data
        if (!file.path || !file.filename) {
          console.error(`❌ Missing Cloudinary data for file ${index}`);
          return;
        }

        // For Cloudinary storage, use the provided path and filename
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
      });
      console.log("📸 Final images array length:", images.length);
      console.log("📸 Featured image:", featuredImage);
    } else {
      console.log("❌ No files found in request");
    }

    const letter = new Letter({
      userId: req.userId,
      title: title.trim(),
      content: content.trim(),
      deliveryDate: new Date(deliveryDate),
      mood: mood || "reflective",
      images,
      featuredImage,
    });

    await letter.save();
    res.status(201).json(letter);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update letter
router.put(
  "/:id",
  [
    auth,
    body("title").optional().trim().isLength({ min: 1 }),
    body("content").optional().trim().isLength({ min: 1 }),
    body("deliveryDate").optional().isISO8601(),
    body("mood")
      .optional()
      .isIn(["happy", "sad", "excited", "anxious", "grateful", "reflective"]),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const letter = await Letter.findOneAndUpdate(
        { _id: req.params.id, userId: req.userId, isDeleted: { $ne: true } },
        req.body,
        { new: true }
      );

      if (!letter) {
        return res.status(404).json({ message: "Letter not found" });
      }

      res.json(letter);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Soft delete letter (mark as deleted)
router.delete("/:id", auth, async (req, res) => {
  try {
    const letter = await Letter.findOne({
      _id: req.params.id,
      userId: req.userId,
      isDeleted: { $ne: true }, // Only allow deleting non-deleted letters
    });

    if (!letter) {
      return res.status(404).json({ message: "Letter not found" });
    }

    // Soft delete - mark as deleted instead of removing
    letter.isDeleted = true;
    letter.deletedAt = new Date();
    await letter.save();

    res.json({ message: "Letter deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Hard delete letter (permanent deletion with image cleanup)
router.delete("/:id/permanent", auth, async (req, res) => {
  try {
    const letter = await Letter.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!letter) {
      return res.status(404).json({ message: "Letter not found" });
    }

    // Delete images from Cloudinary
    if (letter.images && letter.images.length > 0) {
      for (const image of letter.images) {
        try {
          await deleteImage(image.publicId);
        } catch (error) {
          console.error(`Failed to delete image ${image.publicId}:`, error);
        }
      }
    }

    // Permanently delete the letter
    await Letter.findByIdAndDelete(req.params.id);

    res.json({ message: "Letter permanently deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Restore soft-deleted letter
router.patch("/:id/restore", auth, async (req, res) => {
  try {
    const letter = await Letter.findOne({
      _id: req.params.id,
      userId: req.userId,
      isDeleted: true, // Only allow restoring deleted letters
    });

    if (!letter) {
      return res.status(404).json({ message: "Deleted letter not found" });
    }

    // Restore the letter
    letter.isDeleted = false;
    letter.deletedAt = undefined;
    await letter.save();

    res.json({ message: "Letter restored successfully", letter });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get soft-deleted letters (trash/recycle bin)
router.get("/trash", auth, async (req, res) => {
  try {
    const deletedLetters = await Letter.find({
      userId: req.userId,
      isDeleted: true,
    }).sort({
      deletedAt: -1,
    });
    res.json(deletedLetters);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete specific image from letter
router.delete("/:id/images/:imageIndex", auth, async (req, res) => {
  try {
    const letter = await Letter.findOne({
      _id: req.params.id,
      userId: req.userId,
      isDeleted: { $ne: true },
    });

    if (!letter) {
      return res.status(404).json({ message: "Letter not found" });
    }

    const imageIndex = parseInt(req.params.imageIndex);
    if (imageIndex < 0 || imageIndex >= letter.images.length) {
      return res.status(400).json({ message: "Invalid image index" });
    }

    const imageToDelete = letter.images[imageIndex];

    // Delete image from Cloudinary
    try {
      await deleteImage(imageToDelete.publicId);
    } catch (error) {
      console.error(`Failed to delete image ${imageToDelete.publicId}:`, error);
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

    res.json({ message: "Image deleted successfully", letter });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

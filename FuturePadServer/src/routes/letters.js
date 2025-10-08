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

// Get all letters for authenticated user
router.get("/", auth, async (req, res) => {
  try {
    const letters = await Letter.find({ userId: req.userId }).sort({
      createdAt: -1,
    });
    res.json(letters);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get single letter
router.get("/:id", auth, async (req, res) => {
  try {
    const letter = await Letter.findOne({
      _id: req.params.id,
      userId: req.userId,
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

    console.log(req.body);

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

    if (req.files && req.files.length > 0) {
      req.files.forEach((file, index) => {
        const imageData = {
          url: file.path,
          publicId: file.filename,
          caption: req.body[`imageCaption${index}`] || "",
        };
        images.push(imageData);

        // Set first image as featured image
        if (index === 0) {
          featuredImage = {
            url: file.path,
            publicId: file.filename,
          };
        }
      });
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
        { _id: req.params.id, userId: req.userId },
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

// Delete letter and associated images
router.delete("/:id", auth, async (req, res) => {
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

    // Delete the letter
    await Letter.findByIdAndDelete(req.params.id);

    res.json({ message: "Letter deleted successfully" });
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

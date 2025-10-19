const mongoose = require("mongoose");

const letterSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true, // Index for fast user queries
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  content: {
    type: String,
    required: true,
    maxlength: 10000,
  },
  mood: {
    type: String,
    enum: ["happy", "sad", "excited", "anxious", "grateful", "reflective", "calm", "refresh"],
    default: "reflective",
    lowercase: true,
  },
  deliveryDate: {
    type: Date,
    required: true,
    index: true, // Index for date-based queries
  },
  isDelivered: {
    type: Boolean,
    default: false,
    index: true, // Index for filtering delivered/undelivered
  },
  isDeleted: {
    type: Boolean,
    default: false,
    index: true, // Index for filtering deleted letters
  },
  deletedAt: {
    type: Date,
  },
  // Image fields
  images: [
    {
      url: {
        type: String,
        required: true,
      },
      publicId: {
        type: String,
        required: true,
      },
      caption: {
        type: String,
        default: "",
        maxlength: 500,
      },
    },
  ],
  // Optional: Featured image (first image or selected one)
  featuredImage: {
    url: String,
    publicId: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound indexes for common queries
letterSchema.index({ userId: 1, isDeleted: 1, createdAt: -1 });
letterSchema.index({ userId: 1, deliveryDate: 1, isDelivered: 1 });
letterSchema.index({ userId: 1, mood: 1 });

// Update the updatedAt field before saving
letterSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for checking if letter is ready to be delivered
letterSchema.virtual("isReadyForDelivery").get(function () {
  return !this.isDelivered && new Date() >= this.deliveryDate;
});

module.exports = mongoose.model("Letter", letterSchema);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const logger = require("./config/logger");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware
app.use(helmet()); // Set security headers
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(xss()); // Prevent XSS attacks

// CORS configuration - restrict to known origins in production
const corsOptions = {
  origin: process.env.NODE_ENV === "production"
    ? process.env.ALLOWED_ORIGINS?.split(",") || []
    : "*",
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// HTTP request logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined", {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

// Global rate limiter - 100 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// MongoDB connection with retry logic
const connectDB = async (retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      logger.info("📥 MongoDB connected successfully");
      return;
    } catch (error) {
      logger.error(`MongoDB connection error (attempt ${i + 1}/${retries}):`, error);
      if (i === retries - 1) {
        logger.error("Failed to connect to MongoDB after multiple attempts");
        process.exit(1);
      }
      // Wait 5 seconds before retrying
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

// Health check route
app.get("/", (_req, res) => {
  res.json({
    message: "FuturePad Server is running!",
    status: "healthy",
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/letters", require("./routes/letters"));
app.use("/api/profile", require("./routes/profile"));

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

// Global error handling middleware
app.use((err, _req, res, _next) => {
  logger.error("Global error handler:", {
    error: err.message,
    stack: err.stack,
  });

  // Don't expose error details in production
  const errorResponse = {
    success: false,
    message: process.env.NODE_ENV === "production"
      ? "An error occurred"
      : err.message,
  };

  // Add error details in development
  if (process.env.NODE_ENV === "development") {
    errorResponse.stack = err.stack;
  }

  res.status(err.status || 500).json(errorResponse);
});

// Start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    logger.info(`✅ Server is running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
  });
};

startServer();

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM signal received: closing HTTP server");
  mongoose.connection.close(false, () => {
    logger.info("MongoDB connection closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  logger.info("SIGINT signal received: closing HTTP server");
  mongoose.connection.close(false, () => {
    logger.info("MongoDB connection closed");
    process.exit(0);
  });
});

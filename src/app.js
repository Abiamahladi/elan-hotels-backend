const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { rateLimit } = require("express-rate-limit");

const roomRoutes = require("./routes/room.routes");
const bookingRoutes = require("./routes/booking.routes");
const errorHandler = require("./middleware/error.middleware");

const app = express();

app.disable("x-powered-by");

app.use(helmet());

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://elan-hotels.vercel.app"
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    const error = new Error("CORS origin not allowed");
    error.status = 403;
    return callback(error);
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: "10kb" }));

app.use(morgan(
  process.env.NODE_ENV === "production" ? "combined" : "dev"
));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later."
  }
});

const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many booking requests. Please try again later."
  }
});

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Elan Hotels API is running"
  });
});

app.use("/rooms", apiLimiter, roomRoutes);
app.use("/bookings", apiLimiter, bookingLimiter, bookingRoutes);

app.use(errorHandler);

module.exports = app;

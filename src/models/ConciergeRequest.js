const mongoose = require("mongoose");

const conciergeRequestSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      index: true
    },

    category: {
      type: String,
      enum: [
        "housekeeping",
        "airport_pickup",
        "room_service",
        "maintenance",
        "other"
      ],
      required: true
    },

    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 1000
    },

    preferredTime: {
      type: Date,
      default: null
    },

    status: {
      type: String,
      enum: [
        "pending",
        "in_progress",
        "completed",
        "cancelled"
      ],
      default: "pending"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "ConciergeRequest",
  conciergeRequestSchema
);

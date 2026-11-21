const mongoose = require("mongoose");

const preArrivalCheckInSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true
    },

    expectedArrivalTime: {
      type: Date,
      required: true
    },

    numberOfArrivingGuests: {
      type: Number,
      required: true,
      min: 1
    },

    specialRequests: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ""
    },

    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "pending"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "PreArrivalCheckIn",
  preArrivalCheckInSchema
);

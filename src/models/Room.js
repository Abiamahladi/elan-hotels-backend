const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    capacity: {
      type: Number,
      required: true,
      min: 1
    },
    availability: {
      type: String,
      enum: ["Available", "Unavailable"],
      default: "Available"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", roomSchema);

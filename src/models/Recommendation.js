const mongoose = require("mongoose");

const recommendationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 150
    },
    category: {
      type: String,
      required: true,
      enum: [
        "restaurant",
        "attraction",
        "shopping",
        "entertainment",
        "wellness",
        "other"
      ]
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 1000
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    imageUrl: {
      type: String,
      default: null
    },
    websiteUrl: {
      type: String,
      default: null
    },
    contactPhone: {
      type: String,
      default: null
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

recommendationSchema.index({
  isActive: 1,
  category: 1
});

module.exports = mongoose.model(
  "Recommendation",
  recommendationSchema
);

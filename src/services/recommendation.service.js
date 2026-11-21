const mongoose = require("mongoose");
const Recommendation = require("../models/Recommendation");

const getRecommendations = async (category) => {
  const filter = { isActive: true };

  if (category) {
    filter.category = category;
  }

  return Recommendation.find(filter)
    .select(
      "name category description location imageUrl websiteUrl contactPhone"
    )
    .sort({ createdAt: -1 })
    .lean();
};

const getRecommendationById = async (id) => {
  if (!mongoose.isObjectIdOrHexString(id)) {
    const error = new Error("Invalid recommendation ID");
    error.status = 400;
    throw error;
  }

  const recommendation = await Recommendation.findOne({
    _id: id,
    isActive: true
  })
    .select(
      "name category description location imageUrl websiteUrl contactPhone"
    )
    .lean();

  if (!recommendation) {
    const error = new Error("Recommendation not found");
    error.status = 404;
    throw error;
  }

  return recommendation;
};

module.exports = {
  getRecommendations,
  getRecommendationById
};

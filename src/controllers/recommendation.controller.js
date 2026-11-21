const {
  getRecommendations,
  getRecommendationById
} = require("../services/recommendation.service");

const allowedCategories = [
  "restaurant",
  "attraction",
  "shopping",
  "entertainment",
  "wellness",
  "other"
];

const listRecommendations = async (req, res, next) => {
  try {
    const { category } = req.query;

    if (category && !allowedCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid recommendation category"
      });
    }

    const recommendations = await getRecommendations(category);

    const data = recommendations.map(recommendation => ({
      id: recommendation._id.toString(),
      name: recommendation.name,
      category: recommendation.category,
      description: recommendation.description,
      location: recommendation.location,
      imageUrl: recommendation.imageUrl,
      websiteUrl: recommendation.websiteUrl,
      contactPhone: recommendation.contactPhone
    }));

    return res.status(200).json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    next(error);
  }
};

const getRecommendation = async (req, res, next) => {
  try {
    const recommendation = await getRecommendationById(req.params.id);

    return res.status(200).json({
      success: true,
      data: {
        id: recommendation._id.toString(),
        name: recommendation.name,
        category: recommendation.category,
        description: recommendation.description,
        location: recommendation.location,
        imageUrl: recommendation.imageUrl,
        websiteUrl: recommendation.websiteUrl,
        contactPhone: recommendation.contactPhone
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listRecommendations,
  getRecommendation
};

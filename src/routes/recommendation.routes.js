const express = require("express");

const {
  listRecommendations,
  getRecommendation
} = require("../controllers/recommendation.controller");

const router = express.Router();

router.get("/", listRecommendations);
router.get("/:id", getRecommendation);

module.exports = router;

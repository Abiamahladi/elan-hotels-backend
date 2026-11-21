"use strict";

const Recommendation = require("../src/models/Recommendation");
const { buildSeedPlan } = require("./recommendation-seed-plan");

async function insertRecommendations(seedData) {
  const existing = await Recommendation.find({})
    .select("name")
    .lean();

  const plan = buildSeedPlan(seedData, existing);
  const pending = plan.filter(item => item.action === "INSERT");

  const validated = [];

  for (const item of pending) {
    const { action, ...data } = item;
    const document = new Recommendation(data);

    await document.validate();
    validated.push(document);
  }

  if (validated.length === 0) {
    return {
      inserted: 0,
      skipped: plan.length
    };
  }

  const inserted = await Recommendation.insertMany(
    validated,
    { ordered: true }
  );

  return {
    inserted: inserted.length,
    skipped: plan.length - inserted.length
  };
}

module.exports = { insertRecommendations };

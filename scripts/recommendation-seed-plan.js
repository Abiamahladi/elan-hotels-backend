"use strict";

function normalize(value) {
  return value
    .normalize("NFKC")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function buildSeedPlan(seedData, existingData) {
  const existingNames = new Set(
    existingData.map(item => normalize(item.name))
  );

  const seen = new Set();

  return seedData.map(item => {
    const key = normalize(item.name);

    if (seen.has(key)) {
      throw new Error(`Duplicate seed name: ${item.name}`);
    }

    seen.add(key);

    return {
      ...item,
      action: existingNames.has(key)
        ? "SKIP"
        : "INSERT"
    };
  });
}

module.exports = { buildSeedPlan };

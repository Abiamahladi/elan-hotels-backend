"use strict";

require("dotenv").config({ quiet: true });

const mongoose = require("mongoose");
const Recommendation = require("../src/models/Recommendation");
const seedData = require("./seed-data/recommendations");
const { buildSeedPlan } = require("./recommendation-seed-plan");

async function main() {
  if (process.argv.length > 2) {
    throw new Error("This script supports preview mode only.");
  }

  const validated = [];

  for (const item of seedData) {
    const document = new Recommendation(item);
    await document.validate();

    validated.push({
      name: document.name,
      category: document.category,
      location: document.location
    });
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing.");
  }

  const uri = new URL(process.env.MONGODB_URI);

  if (decodeURIComponent(uri.pathname.slice(1)) !== "elan_hotels") {
    throw new Error("Unexpected MongoDB database in URI.");
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    autoIndex: false
  });

  if (mongoose.connection.db.databaseName !== "elan_hotels") {
    throw new Error("Connected to an unexpected database.");
  }

  const existing = await Recommendation.find({})
    .select("name category location isActive")
    .lean();

  const plan = buildSeedPlan(validated, existing);

  const preview = plan.map(item => ({
    ...item,
    action: item.action === "INSERT"
      ? "WOULD INSERT"
      : "SKIP - POSSIBLE DUPLICATE"
  }));

  console.log("=== Elan Hotels Database Seed Preview ===");
  console.log("Database:", mongoose.connection.db.databaseName);
  console.log("Mode: READ-ONLY");
  console.table(preview);

  console.log("Total seed records:", preview.length);
  console.log(
    "Would insert:",
    preview.filter(item => item.action === "WOULD INSERT").length
  );
  console.log(
    "Possible duplicates:",
    preview.filter(item => item.action !== "WOULD INSERT").length
  );
  console.log("Records inserted: 0");
  console.log("Records modified: 0");
}

main()
  .catch(error => {
    console.error("Preview failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });

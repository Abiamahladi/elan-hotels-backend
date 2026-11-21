"use strict";

require("dotenv").config({ quiet: true });

const mongoose = require("mongoose");

const Recommendation = require("../src/models/Recommendation");
const recommendations = require("./seed-data/recommendations");
const { assertProductionWriteAllowed } = require("./seed-safety");

async function main() {
  console.log("=== Elan Hotels Recommendations Seed ===");
  console.log("Mode: DRY RUN (offline)");
  console.log("MongoDB connection: DISABLED");
  console.log();

  if (process.argv.length === 3 &&
      process.argv[2] === "--preview-db") {
    const { spawnSync } = require("node:child_process");

    const result = spawnSync(
      process.execPath,
      [require.resolve("./preview-recommendations")],
      { stdio: "inherit" }
    );

    if (result.error) {
      throw result.error;
    }

    if (result.status !== 0) {
      throw new Error("Database preview failed.");
    }

    return;
  }

  if (process.argv.includes("--write")) {
    assertProductionWriteAllowed(
      process.argv.slice(2),
      process.env.MONGODB_URI,
      "elan_hotels"
    );

    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      autoIndex: false
    });

    try {
      const databaseName = mongoose.connection.db.databaseName;

      assertProductionWriteAllowed(
        process.argv.slice(2),
        process.env.MONGODB_URI,
        databaseName
      );

      const { insertRecommendations } =
        require("./insert-recommendations");

      const result = await insertRecommendations(recommendations);

      console.log("Inserted:", result.inserted);
      console.log("Skipped:", result.skipped);
    } finally {
      await mongoose.disconnect();
    }

    return;
  }

  if (process.argv.length > 2) {
    throw new Error("Unsupported arguments.");
  }

  const validated = [];

  for (const data of recommendations) {
    const document = new Recommendation(data);

    await document.validate();

    validated.push({
      name: document.name,
      category: document.category,
      description: document.description,
      location: document.location,
      imageUrl: document.imageUrl,
      websiteUrl: document.websiteUrl,
      contactPhone: document.contactPhone,
      isActive: document.isActive
    });
  }

  const keys = new Set();

  for (const item of validated) {
    const key = [
      item.name.trim().toLowerCase(),
      item.location.trim().toLowerCase()
    ].join("|");

    if (keys.has(key)) {
      throw new Error(`Duplicate seed record: ${item.name}`);
    }

    keys.add(key);
  }

  console.table(
    validated.map(({ name, category, location }) => ({
      name,
      category,
      location
    }))
  );

  console.log();
  console.log(`Validated records: ${validated.length}`);
  console.log("Database records inserted: 0");
  console.log("Database records modified: 0");
  console.log("Dry run completed successfully.");
}

main().catch(error => {
  console.error("Seed validation failed:", error.message);
  process.exitCode = 1;
});

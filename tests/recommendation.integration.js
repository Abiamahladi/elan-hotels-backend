require("dotenv").config();

const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const { randomUUID } = require("node:crypto");

const Recommendation = require("../src/models/Recommendation");

const {
  getRecommendations,
  getRecommendationById
} = require("../src/services/recommendation.service");

const TEST_DB = "elan_hotels_test";

async function main() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing");
  }

  const testId = randomUUID();
  const createdIds = [];

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: TEST_DB,
      serverSelectionTimeoutMS: 10000
    });

    assert.equal(
      mongoose.connection.db.databaseName,
      TEST_DB,
      "Unsafe database connection"
    );

    console.log("Connected to isolated test database:", TEST_DB);

    const recommendations = await Recommendation.create([
      {
        name: `Test Restaurant ${testId}`,
        category: "restaurant",
        description: "A restaurant recommended for hotel guests.",
        location: "Test Location",
        isActive: true
      },
      {
        name: `Test Attraction ${testId}`,
        category: "attraction",
        description: "A local attraction recommended for guests.",
        location: "Test Location",
        isActive: true
      },
      {
        name: `Inactive Test Venue ${testId}`,
        category: "entertainment",
        description: "An inactive venue hidden from guests.",
        location: "Test Location",
        isActive: false
      }
    ]);

    createdIds.push(...recommendations.map(item => item._id));

    console.log("PASS: Test recommendations created");

    const active = await getRecommendations();

    const testActive = active.filter(item =>
      item.name.includes(testId)
    );

    assert.equal(testActive.length, 2);
    console.log("PASS: Active recommendations retrieved");

    const restaurants = await getRecommendations("restaurant");

    const testRestaurants = restaurants.filter(item =>
      item.name.includes(testId)
    );

    assert.equal(testRestaurants.length, 1);
    assert.equal(testRestaurants[0].category, "restaurant");

    console.log("PASS: Category filtering works");

    const restaurant = recommendations[0];

    const retrieved = await getRecommendationById(
      restaurant._id.toString()
    );

    assert.equal(
      retrieved._id.toString(),
      restaurant._id.toString()
    );

    console.log("PASS: Recommendation retrieved by ID");

    await assert.rejects(
      getRecommendationById(recommendations[2]._id.toString()),
      error => error.status === 404
    );

    console.log("PASS: Inactive recommendation hidden");

    await assert.rejects(
      getRecommendationById("invalid-id"),
      error => error.status === 400
    );

    console.log("PASS: Invalid recommendation ID rejected");
  } finally {
    if (
      createdIds.length > 0 &&
      mongoose.connection.db?.databaseName === TEST_DB
    ) {
      await Recommendation.deleteMany({
        _id: { $in: createdIds }
      });

      console.log("Temporary test records cleaned up");
    }

    await mongoose.disconnect();
  }
}

main().catch(error => {
  console.error("Integration test failed:", error.message);
  process.exitCode = 1;
});

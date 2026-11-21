require("dotenv").config();

const assert = require("node:assert/strict");
const http = require("node:http");
const mongoose = require("mongoose");
const { randomUUID } = require("node:crypto");

const app = require("../src/app");
const Recommendation = require("../src/models/Recommendation");

const TEST_DB = "elan_hotels_test";

async function main() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing");
  }

  const server = http.createServer(app);
  const createdIds = [];
  const testId = randomUUID();

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

    const records = await Recommendation.create([
      {
        name: `HTTP Test Restaurant ${testId}`,
        category: "restaurant",
        description: "A recommended restaurant for guests.",
        location: "Test Location",
        isActive: true
      },
      {
        name: `HTTP Test Attraction ${testId}`,
        category: "attraction",
        description: "A recommended attraction for guests.",
        location: "Test Location",
        isActive: true
      },
      {
        name: `HTTP Inactive Venue ${testId}`,
        category: "entertainment",
        description: "An inactive recommendation for testing.",
        location: "Test Location",
        isActive: false
      }
    ]);

    createdIds.push(...records.map(item => item._id));

    await new Promise((resolve, reject) => {
      server.once("error", reject);
      server.listen(0, "127.0.0.1", resolve);
    });

    const baseUrl =
      `http://127.0.0.1:${server.address().port}`;

    const listResponse = await fetch(
      `${baseUrl}/recommendations`
    );

    const listResult = await listResponse.json();

    assert.equal(listResponse.status, 200);
    assert.equal(listResult.success, true);

    const testRecords = listResult.data.filter(item =>
      item.name.includes(testId)
    );

    assert.equal(testRecords.length, 2);

    console.log("PASS: HTTP active recommendations retrieved");

    const categoryResponse = await fetch(
      `${baseUrl}/recommendations?category=restaurant`
    );

    const categoryResult = await categoryResponse.json();

    assert.equal(categoryResponse.status, 200);

    const restaurants = categoryResult.data.filter(item =>
      item.name.includes(testId)
    );

    assert.equal(restaurants.length, 1);
    assert.equal(restaurants[0].category, "restaurant");

    console.log("PASS: HTTP category filtering");

    const detailResponse = await fetch(
      `${baseUrl}/recommendations/${records[0]._id}`
    );

    const detailResult = await detailResponse.json();

    assert.equal(detailResponse.status, 200);
    assert.equal(
      detailResult.data.id,
      records[0]._id.toString()
    );

    console.log("PASS: HTTP recommendation details");

    const inactiveResponse = await fetch(
      `${baseUrl}/recommendations/${records[2]._id}`
    );

    assert.equal(inactiveResponse.status, 404);

    console.log("PASS: HTTP inactive recommendation hidden");

    console.log("PASS: Full Guest Recommendations HTTP integration");
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

    if (server.listening) {
      await new Promise(resolve => server.close(resolve));
    }

    await mongoose.disconnect();
  }
}

main().catch(error => {
  console.error("HTTP integration test failed:", error.message);
  process.exitCode = 1;
});

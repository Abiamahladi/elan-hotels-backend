require("dotenv").config();

const assert = require("node:assert/strict");
const http = require("node:http");
const { randomUUID } = require("node:crypto");
const mongoose = require("mongoose");

const app = require("../src/app");
const Booking = require("../src/models/Booking");
const ConciergeRequest = require("../src/models/ConciergeRequest");

const TEST_DB = "elan_hotels_test";

async function main() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing");
  }

  const server = http.createServer(app);
  let booking;

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

    const reference = `ELAN-HTTP-TEST-${randomUUID()}`;
    const email = "concierge-http-test@example.com";

    booking = await Booking.create({
      bookingReference: reference,
      roomId: new mongoose.Types.ObjectId(),
      guestName: "HTTP Test Guest",
      guestEmail: email,
      guestPhone: "08000000000",
      checkIn: new Date("2026-12-15T00:00:00Z"),
      checkOut: new Date("2026-12-17T00:00:00Z"),
      numberOfGuests: 2,
      totalAmount: 170000,
      status: "confirmed"
    });

    await new Promise((resolve, reject) => {
      server.once("error", reject);
      server.listen(0, "127.0.0.1", resolve);
    });

    const baseUrl =
      `http://127.0.0.1:${server.address().port}`;

    const createResponse = await fetch(
      `${baseUrl}/concierge/requests`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingReference: reference,
          guestEmail: email,
          category: "housekeeping",
          description: "Please provide extra towels",
          preferredTime: "2026-12-15T15:00:00Z"
        })
      }
    );

    const created = await createResponse.json();

    assert.equal(createResponse.status, 201);
    assert.equal(created.success, true);
    assert.equal(created.data.status, "pending");

    console.log("PASS: HTTP concierge request created");

    const lookupResponse = await fetch(
      `${baseUrl}/concierge/requests/lookup`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingReference: reference,
          guestEmail: email
        })
      }
    );

    const retrieved = await lookupResponse.json();

    assert.equal(lookupResponse.status, 200);
    assert.equal(retrieved.success, true);
    assert.equal(retrieved.data.length, 1);
    assert.equal(
      retrieved.data[0].id,
      created.data.id
    );

    console.log("PASS: HTTP concierge request retrieved");
    console.log("PASS: Full Express + MongoDB integration");
  } finally {
    if (
      booking &&
      mongoose.connection.db?.databaseName === TEST_DB
    ) {
      await ConciergeRequest.deleteMany({
        bookingId: booking._id
      });

      await Booking.deleteOne({
        _id: booking._id
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

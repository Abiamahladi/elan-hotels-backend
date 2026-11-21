require("dotenv").config();

const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const { randomUUID } = require("node:crypto");

const Booking = require("../src/models/Booking");
const ConciergeRequest = require("../src/models/ConciergeRequest");

const {
  createConciergeRequest,
  getConciergeRequests
} = require("../src/services/conciergeRequest.service");

const TEST_DB = "elan_hotels_test";

async function main() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing");
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: TEST_DB,
    serverSelectionTimeoutMS: 10000
  });

  if (mongoose.connection.db.databaseName !== TEST_DB) {
    throw new Error("Unsafe database connection");
  }

  console.log("Connected to isolated test database:", TEST_DB);

  const reference = `ELAN-TEST-${randomUUID()}`;
  let booking;

  try {
    booking = await Booking.create({
      bookingReference: reference,
      roomId: new mongoose.Types.ObjectId(),
      guestName: "Concierge Test Guest",
      guestEmail: "concierge-test@example.com",
      guestPhone: "08000000000",
      checkIn: new Date("2026-12-15T00:00:00Z"),
      checkOut: new Date("2026-12-17T00:00:00Z"),
      numberOfGuests: 2,
      totalAmount: 170000,
      status: "confirmed"
    });

    const request = await createConciergeRequest({
      bookingReference: reference,
      guestEmail: "concierge-test@example.com",
      category: "housekeeping",
      description: "Please provide extra towels",
      preferredTime: "2026-12-15T15:00:00Z"
    });

    assert.equal(request.status, "pending");
    assert.equal(request.category, "housekeeping");

    console.log("PASS: Concierge request created");

    const requests = await getConciergeRequests(
      reference,
      "concierge-test@example.com"
    );

    assert.equal(requests.length, 1);
    assert.equal(
      requests[0]._id.toString(),
      request._id.toString()
    );

    console.log("PASS: Concierge request retrieved");
    console.log("PASS: Request persisted in MongoDB");

    await assert.rejects(
      getConciergeRequests(
        reference,
        "wrong-email@example.com"
      ),
      error =>
        error.status === 404 &&
        error.message ===
          "Booking not found or verification failed"
    );

    console.log("PASS: Incorrect guest email rejected");

    const secondRequest = await createConciergeRequest({
      bookingReference: reference,
      guestEmail: "concierge-test@example.com",
      category: "airport_pickup",
      description: "Airport pickup required",
      preferredTime: "2026-12-15T12:00:00Z"
    });

    assert.equal(secondRequest.status, "pending");

    const multipleRequests = await getConciergeRequests(
      reference,
      "concierge-test@example.com"
    );

    assert.equal(multipleRequests.length, 2);

    const categories = multipleRequests.map(
      item => item.category
    );

    assert(categories.includes("housekeeping"));
    assert(categories.includes("airport_pickup"));

    console.log("PASS: Multiple concierge requests supported");

    await Booking.updateOne(
      { _id: booking._id },
      { $set: { status: "cancelled" } }
    );

    await assert.rejects(
      createConciergeRequest({
        bookingReference: reference,
        guestEmail: "concierge-test@example.com",
        category: "housekeeping",
        description: "Please clean the room"
      }),
      error =>
        error.status === 400 &&
        error.message ===
          "Cancelled bookings cannot request concierge services"
    );

    console.log("PASS: Cancelled booking rejected");

    await Booking.updateOne(
      { _id: booking._id },
      { $set: { status: "confirmed" } }
    );

    await assert.rejects(
      createConciergeRequest({
        bookingReference: reference,
        guestEmail: "concierge-test@example.com",
        category: "housekeeping",
        description: "Please clean the room",
        preferredTime: "2026-12-18T12:00:00Z"
      }),
      error =>
        error.status === 400 &&
        error.message ===
          "Preferred service time must fall within the booked stay"
    );

    console.log("PASS: Service time outside booking rejected");


    await Booking.updateOne(
      { _id: booking._id },
      { $set: { status: "confirmed" } }
    );



  } finally {
    if (booking) {
      await ConciergeRequest.deleteMany({
        bookingId: booking._id
      });

      await Booking.deleteOne({
        _id: booking._id,
        bookingReference: reference
      });

      console.log("Temporary test records cleaned up");
    }
  }
}

main()
  .catch(error => {
    console.error("Integration test failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });

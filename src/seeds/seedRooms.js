require("dotenv").config();

const mongoose = require("mongoose");
const Room = require("../models/Room");
const connectDB = require("../config/database");

const rooms = [
  {
    name: "Premium Room",
    price: 85000,
    capacity: 2,
    availability: "Available"
  },
  {
    name: "Executive Suite",
    price: 125000,
    capacity: 3,
    availability: "Available"
  },
  {
    name: "Deluxe King Room",
    price: 95000,
    capacity: 2,
    availability: "Available"
  },
  {
    name: "Ambassador Loft",
    price: 165000,
    capacity: 4,
    availability: "Available"
  }
];

async function seedRooms() {
  try {
    await connectDB();

    for (const room of rooms) {
      await Room.findOneAndUpdate(
        { name: room.name },
        { $set: room },
        { upsert: true, returnDocument: "after", runValidators: true }
      );
    }

    console.log("Sample rooms seeded successfully");
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedRooms();

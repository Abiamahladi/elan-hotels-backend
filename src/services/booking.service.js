const { generateBookingReference } = require("../utils/referenceGenerator");
const mongoose = require("mongoose");
const Room = require("../models/Room");
const Booking = require("../models/Booking");
const RoomReservation = require("../models/RoomReservation");

const DAY_MS = 24 * 60 * 60 * 1000;

function parseDate(value) {
  const date = new Date(`${value}T00:00:00.000Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    const error = new Error("Invalid calendar date");
    error.status = 400;
    throw error;
  }

  return date;
}

async function createBooking(data) {
  const checkIn = parseDate(data.checkIn);
  const checkOut = parseDate(data.checkOut);

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  if (checkIn < today) {
    const error = new Error("Check-in cannot be in the past");
    error.status = 400;
    throw error;
  }

  if (checkOut <= checkIn) {
    const error = new Error(
      "Check-out must be after check-in"
    );
    error.status = 400;
    throw error;
  }

  const nights = Math.round(
    (checkOut.getTime() - checkIn.getTime()) / DAY_MS
  );

  if (nights > 30) {
    const error = new Error(
      "Bookings cannot exceed 30 nights"
    );
    error.status = 400;
    throw error;
  }

  const room = await Room.findById(data.roomId);

  if (!room) {
    const error = new Error("Room not found");
    error.status = 404;
    throw error;
  }

  if (room.availability !== "Available") {
    const error = new Error("Room is unavailable");
    error.status = 409;
    throw error;
  }

  if (data.numberOfGuests > room.capacity) {
    const error = new Error(
      "Number of guests exceeds room capacity"
    );
    error.status = 400;
    throw error;
  }

  const dates = [];

  for (let i = 0; i < nights; i++) {
    dates.push(
      new Date(checkIn.getTime() + i * DAY_MS)
        .toISOString()
        .slice(0, 10)
    );
  }

  let savedBooking;

  try {
    await mongoose.connection.transaction(async session => {
      const [booking] = await Booking.create([{
        roomId: room._id,
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        guestPhone: data.guestPhone,
        checkIn,
        checkOut,
        numberOfGuests: data.numberOfGuests,
        totalAmount: room.price * nights,
        status: "pending",
        bookingReference: generateBookingReference()
      }], { session });

      await RoomReservation.insertMany(
        dates.map(date => ({
          roomId: room._id,
          date,
          bookingId: booking._id
        })),
        { session, ordered: true }
      );

      savedBooking = booking;
    });

    return savedBooking;
  } catch (error) {
    if (error.code === 11000) {
      const conflict = new Error(
        "Room is already reserved for one or more selected dates"
      );
      conflict.status = 409;
      throw conflict;
    }

    throw error;
  }
}

module.exports = { createBooking };

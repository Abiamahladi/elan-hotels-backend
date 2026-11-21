const Booking = require("../models/Booking");
const PreArrivalCheckIn = require("../models/PreArrivalCheckIn");

function createError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

async function verifyBooking(bookingReference, guestEmail) {
  const booking = await Booking.findOne({
    bookingReference,
    guestEmail: guestEmail.trim().toLowerCase()
  });

  if (!booking) {
    throw createError("Booking not found or verification failed", 404);
  }

  if (booking.status === "cancelled") {
    throw createError("Cancelled bookings cannot be checked in", 400);
  }

  return booking;
}

async function createPreArrivalCheckIn(data) {
  const booking = await verifyBooking(
    data.bookingReference,
    data.guestEmail
  );

  const arrivalTime = new Date(data.expectedArrivalTime);

  if (arrivalTime < new Date()) {
    throw createError("Expected arrival time cannot be in the past", 400);
  }

  const checkInDay = new Date(booking.checkIn);
  const checkOutDay = new Date(booking.checkOut);

  // Allow arrival during the booked stay.
  if (arrivalTime < checkInDay || arrivalTime >= checkOutDay) {
    throw createError(
      "Expected arrival must fall within the booked stay",
      400
    );
  }

  if (data.numberOfArrivingGuests > booking.numberOfGuests) {
    throw createError(
      "Arriving guests cannot exceed the booked guest count",
      400
    );
  }

  const existing = await PreArrivalCheckIn.findOne({
    bookingId: booking._id
  });

  if (existing) {
    throw createError(
      "Pre-arrival check-in already submitted for this booking",
      409
    );
  }

  try {
    return await PreArrivalCheckIn.create({
      bookingId: booking._id,
      expectedArrivalTime: arrivalTime,
      numberOfArrivingGuests: data.numberOfArrivingGuests,
      specialRequests: data.specialRequests || "",
      status: "pending"
    });
  } catch (error) {
    if (error.code === 11000) {
      throw createError(
        "Pre-arrival check-in already submitted for this booking",
        409
      );
    }
    throw error;
  }
}

async function getPreArrivalCheckIn(bookingReference, guestEmail) {
  const booking = await verifyBooking(bookingReference, guestEmail);

  const checkIn = await PreArrivalCheckIn.findOne({
    bookingId: booking._id
  });

  if (!checkIn) {
    throw createError("Pre-arrival check-in not found", 404);
  }

  return checkIn;
}

module.exports = {
  createPreArrivalCheckIn,
  getPreArrivalCheckIn
};

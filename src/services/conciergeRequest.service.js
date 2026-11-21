const Booking = require("../models/Booking");
const ConciergeRequest = require("../models/ConciergeRequest");

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
    throw createError(
      "Booking not found or verification failed",
      404
    );
  }

  if (booking.status === "cancelled") {
    throw createError(
      "Cancelled bookings cannot request concierge services",
      400
    );
  }

  return booking;
}

async function createConciergeRequest(data) {
  const booking = await verifyBooking(
    data.bookingReference,
    data.guestEmail
  );

  let preferredTime = null;

  if (data.preferredTime) {
    preferredTime = new Date(data.preferredTime);

    if (preferredTime < new Date()) {
      throw createError(
        "Preferred service time cannot be in the past",
        400
      );
    }

    if (
      preferredTime < new Date(booking.checkIn) ||
      preferredTime >= new Date(booking.checkOut)
    ) {
      throw createError(
        "Preferred service time must fall within the booked stay",
        400
      );
    }
  }

  return ConciergeRequest.create({
    bookingId: booking._id,
    category: data.category,
    description: data.description,
    preferredTime,
    status: "pending"
  });
}

async function getConciergeRequests(bookingReference, guestEmail) {
  const booking = await verifyBooking(
    bookingReference,
    guestEmail
  );

  return ConciergeRequest.find({
    bookingId: booking._id
  }).sort({ createdAt: -1 });
}

module.exports = {
  createConciergeRequest,
  getConciergeRequests
};

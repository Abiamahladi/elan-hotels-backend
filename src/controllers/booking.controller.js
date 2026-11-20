const bookingSchema = require("../validators/booking.validator");
const { createBooking } = require("../services/booking.service");

async function postBooking(req, res, next) {
  try {
    const { error, value } = bookingSchema.validate(req.body, {
      abortEarly: false
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.details.map(item => item.message)
      });
    }

    const booking = await createBooking(value);

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: {
        id: booking._id.toString(),
        bookingReference: booking.bookingReference,
        roomId: booking.roomId.toString(),
        status: booking.status,
        totalAmount: booking.totalAmount,
        checkIn: booking.checkIn.toISOString().slice(0, 10),
        checkOut: booking.checkOut.toISOString().slice(0, 10)
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { postBooking };

const Booking = require("../models/Booking");
const bookingLookupSchema = require(
  "../validators/bookingLookup.validator"
);

async function lookupBooking(req, res, next) {
  try {
    const { error, value } = bookingLookupSchema.validate(
      req.body,
      { abortEarly: false }
    );

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking lookup request"
      });
    }

    const booking = await Booking.findOne({
      bookingReference: value.bookingReference,
      guestEmail: value.guestEmail.trim().toLowerCase()
    }).populate("roomId", "name price capacity");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found or verification failed"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Booking retrieved successfully",
      data: {
        bookingReference: booking.bookingReference,
        room: booking.roomId,
        guestName: booking.guestName,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        numberOfGuests: booking.numberOfGuests,
        totalAmount: booking.totalAmount,
        status: booking.status
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports.lookupBooking = lookupBooking;

const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Room"
  },
  date: {
    type: String,
    required: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Booking"
  }
});

reservationSchema.index(
  { roomId: 1, date: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "RoomReservation",
  reservationSchema
);

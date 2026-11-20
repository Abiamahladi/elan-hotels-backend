const Joi = require("joi");

const bookingSchema = Joi.object({
  roomId: Joi.string().hex().length(24).required(),
  guestName: Joi.string().trim().min(2).max(100).required(),
  guestEmail: Joi.string().email().required(),
  guestPhone: Joi.string().trim().min(7).max(20).required(),
  checkIn: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required(),
  checkOut: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required(),
  numberOfGuests: Joi.number().integer().min(1).required()
});

module.exports = bookingSchema;

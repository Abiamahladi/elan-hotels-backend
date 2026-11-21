const Joi = require("joi");

const preArrivalCheckInSchema = Joi.object({
  bookingReference: Joi.string()
    .trim()
    .required(),

  guestEmail: Joi.string()
    .email()
    .required(),

  expectedArrivalTime: Joi.date()
    .iso()
    .required(),

  numberOfArrivingGuests: Joi.number()
    .integer()
    .min(1)
    .required(),

  specialRequests: Joi.string()
    .trim()
    .max(500)
    .allow("")
    .optional()
});

module.exports = preArrivalCheckInSchema;

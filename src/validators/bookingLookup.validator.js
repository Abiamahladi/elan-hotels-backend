const Joi = require("joi");

const bookingLookupSchema = Joi.object({
  bookingReference: Joi.string()
    .pattern(/^ELAN-[0-9]{4}-[A-F0-9]{12}$/)
    .required(),

  guestEmail: Joi.string()
    .trim()
    .email()
    .required()
});

module.exports = bookingLookupSchema;

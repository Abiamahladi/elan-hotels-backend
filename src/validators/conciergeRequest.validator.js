const Joi = require("joi");

const createConciergeRequestSchema = Joi.object({
  bookingReference: Joi.string()
    .trim()
    .required(),

  guestEmail: Joi.string()
    .email()
    .trim()
    .lowercase()
    .required(),

  category: Joi.string()
    .valid(
      "housekeeping",
      "airport_pickup",
      "room_service",
      "maintenance",
      "other"
    )
    .required(),

  description: Joi.string()
    .trim()
    .min(5)
    .max(1000)
    .required(),

  preferredTime: Joi.date()
    .iso()
    .optional()
});

const lookupConciergeRequestsSchema = Joi.object({
  bookingReference: Joi.string()
    .trim()
    .required(),

  guestEmail: Joi.string()
    .email()
    .trim()
    .lowercase()
    .required()
});

module.exports = {
  createConciergeRequestSchema,
  lookupConciergeRequestsSchema
};

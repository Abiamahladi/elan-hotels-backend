const {
  createConciergeRequestSchema,
  lookupConciergeRequestsSchema
} = require("../validators/conciergeRequest.validator");

const {
  createConciergeRequest,
  getConciergeRequests
} = require("../services/conciergeRequest.service");

async function postConciergeRequest(req, res, next) {
  try {
    const { error, value } =
      createConciergeRequestSchema.validate(req.body, {
        abortEarly: false
      });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.details.map(item => item.message)
      });
    }

    const request = await createConciergeRequest(value);

    return res.status(201).json({
      success: true,
      message: "Concierge request submitted successfully",
      data: {
        id: request._id,
        category: request.category,
        description: request.description,
        preferredTime: request.preferredTime,
        status: request.status,
        createdAt: request.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
}

async function lookupConciergeRequests(req, res, next) {
  try {
    const { error, value } =
      lookupConciergeRequestsSchema.validate(req.body, {
        abortEarly: false
      });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.details.map(item => item.message)
      });
    }

    const requests = await getConciergeRequests(
      value.bookingReference,
      value.guestEmail
    );

    return res.status(200).json({
      success: true,
      message: "Concierge requests retrieved successfully",
      data: requests.map(request => ({
        id: request._id,
        category: request.category,
        description: request.description,
        preferredTime: request.preferredTime,
        status: request.status,
        createdAt: request.createdAt
      }))
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  postConciergeRequest,
  lookupConciergeRequests
};

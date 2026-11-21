const checkInSchema = require(
  "../validators/preArrivalCheckIn.validator"
);

const {
  createPreArrivalCheckIn,
  getPreArrivalCheckIn
} = require("../services/preArrivalCheckIn.service");

async function postPreArrivalCheckIn(req, res, next) {
  try {
    const { error, value } = checkInSchema.validate(req.body, {
      abortEarly: false
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.details.map(item => item.message)
      });
    }

    const checkIn = await createPreArrivalCheckIn(value);

    return res.status(201).json({
      success: true,
      message: "Pre-arrival check-in submitted successfully",
      data: {
        id: checkIn._id,
        expectedArrivalTime: checkIn.expectedArrivalTime,
        numberOfArrivingGuests: checkIn.numberOfArrivingGuests,
        specialRequests: checkIn.specialRequests,
        status: checkIn.status
      }
    });
  } catch (error) {
    next(error);
  }
}

async function lookupPreArrivalCheckIn(req, res, next) {
  try {
    const { error, value } = checkInSchema
      .fork(
        ["expectedArrivalTime", "numberOfArrivingGuests"],
        field => field.optional()
      )
      .fork(
        ["specialRequests"],
        field => field.forbidden()
      )
      .validate(req.body, {
        abortEarly: false
      });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.details.map(item => item.message)
      });
    }

    const checkIn = await getPreArrivalCheckIn(
      value.bookingReference.trim(),
      value.guestEmail
    );

    return res.status(200).json({
      success: true,
      message: "Pre-arrival check-in retrieved successfully",
      data: {
        expectedArrivalTime: checkIn.expectedArrivalTime,
        numberOfArrivingGuests: checkIn.numberOfArrivingGuests,
        specialRequests: checkIn.specialRequests,
        status: checkIn.status
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  postPreArrivalCheckIn,
  lookupPreArrivalCheckIn
};

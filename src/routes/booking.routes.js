const express = require("express");

const {
  postBooking,
  lookupBooking
} = require("../controllers/booking.controller");

const router = express.Router();

router.post("/", postBooking);
router.post("/lookup", lookupBooking);

module.exports = router;

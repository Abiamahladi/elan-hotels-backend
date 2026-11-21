const express = require("express");

const {
  postPreArrivalCheckIn,
  lookupPreArrivalCheckIn
} = require("../controllers/preArrivalCheckIn.controller");

const router = express.Router();

router.post("/", postPreArrivalCheckIn);
router.post("/lookup", lookupPreArrivalCheckIn);

module.exports = router;

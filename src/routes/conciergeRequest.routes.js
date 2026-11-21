const express = require("express");

const {
  postConciergeRequest,
  lookupConciergeRequests
} = require("../controllers/conciergeRequest.controller");

const router = express.Router();

router.post("/", postConciergeRequest);
router.post("/lookup", lookupConciergeRequests);

module.exports = router;

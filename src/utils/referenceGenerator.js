const { randomBytes } = require("crypto");

function generateBookingReference() {
  const year = new Date().getUTCFullYear();
  const code = randomBytes(6).toString("hex").toUpperCase();

  return `ELAN-${year}-${code}`;
}

module.exports = { generateBookingReference };

"use strict";

function assertProductionWriteAllowed(args, uri, databaseName) {
  const expectedArgs = [
    "--write",
    "--confirm-production=elan_hotels"
  ];

  if (
    args.length !== expectedArgs.length ||
    args.some((arg, index) => arg !== expectedArgs[index])
  ) {
    throw new Error(
      "Production write blocked. Explicit confirmation required."
    );
  }

  if (!uri) {
    throw new Error("MONGODB_URI is missing.");
  }

  const parsed = new URL(uri);
  const uriDatabase = decodeURIComponent(parsed.pathname.slice(1));

  if (
    !["mongodb:", "mongodb+srv:"].includes(parsed.protocol) ||
    uriDatabase !== "elan_hotels" ||
    databaseName !== "elan_hotels"
  ) {
    throw new Error(
      "Production write blocked: database verification failed."
    );
  }

  return true;
}

module.exports = { assertProductionWriteAllowed };

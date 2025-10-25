// Simplified licensing for self-hosted: optionally spoof an enterprise license.
// Allows overriding via env vars without requiring database tables.

type SimpleInstanceLicense = {
  seats: number;
  type: "PLUS" | "ORGANIZATION" | "ENTERPRISE";
};

/**
 * Returns a mocked instance license object. This avoids hitting prisma.instanceLicense
 * for environments where the table/migrations are not present. You can override via:
 *   SELF_HOSTED_LICENSE_TYPE (PLUS|ORGANIZATION|ENTERPRISE)
 *   SELF_HOSTED_LICENSE_SEATS (number)
 */
export function getInstanceLicense(): Promise<SimpleInstanceLicense> {
  const typeEnv = process.env.SELF_HOSTED_LICENSE_TYPE as SimpleInstanceLicense["type"] | undefined;
  const type: SimpleInstanceLicense["type"] =
    typeEnv === "PLUS" || typeEnv === "ORGANIZATION" || typeEnv === "ENTERPRISE"
      ? typeEnv
      : "ENTERPRISE";

  const seatsEnv = process.env.SELF_HOSTED_LICENSE_SEATS;
  const seatsParsed = seatsEnv ? Number.parseInt(seatsEnv, 10) : NaN;
  const seats = Number.isFinite(seatsParsed) && seatsParsed > 0 ? seatsParsed : 999;

  return Promise.resolve({ seats, type });
}

// Backwards-compatible loader used by the license admin page.
// Returns an object shaped like the original prisma InstanceLicense or null.
export async function loadInstanceLicense() {
  const license = await getInstanceLicense();
  return {
    licenseKey: "SELF_HOSTED_OVERRIDE_KEY",
    licenseeEmail: process.env.SUPPORT_EMAIL || null,
    licenseeName: process.env.SUPPORT_EMAIL ? "Self-Hosted" : null,
    issuedAt: new Date(0).toISOString(),
    expiresAt: null,
    seats: license.seats,
    type: license.type,
  };
}

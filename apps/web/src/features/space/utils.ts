import type { SpaceMemberRole as PrismaSpaceMemberRole } from "@prisma/client";
import { getSpaceSubscription } from "@/features/billing/data";
import { getInstanceLicense } from "@/features/licensing/data";
import type { LicenseType } from "@/features/licensing/schema";
import type { MemberRole } from "@/features/space/schema";
import { AppError } from "@/lib/errors";
import { isSelfHosted } from "@/utils/constants";

export const toDBRole = (role: MemberRole): PrismaSpaceMemberRole => {
  switch (role) {
    case "member":
      return "MEMBER";
    case "admin":
      return "ADMIN";
  }
};

export const fromDBRole = (role: PrismaSpaceMemberRole): MemberRole => {
  switch (role) {
    case "MEMBER":
      return "member";
    case "ADMIN":
      return "admin";
  }
};

const parsePositiveInt = (value: string | undefined) => {
  if (!value) return undefined;
  const parsed = Number.parseInt(value, 10);
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }
  return undefined;
};

/**
 * Maximum seat limit for self-hosted instances. Can be overridden via SELF_HOSTED_MAX_SEATS.
 */
const MAX_SEAT_LIMIT = parsePositiveInt(process.env.SELF_HOSTED_MAX_SEATS) ?? 999;

/**
 * Default seat limit for spaces without active subscriptions (self-hosted w/out license)
 * Can be overridden via SELF_HOSTED_DEFAULT_SEATS but will never exceed MAX_SEAT_LIMIT.
 */
const DEFAULT_SEAT_LIMIT = Math.min(
  parsePositiveInt(process.env.SELF_HOSTED_DEFAULT_SEATS) ?? 1,
  MAX_SEAT_LIMIT,
);

/**
 * Returns the seat limit for self-hosted instances based on license type
 */
export function getSelfHostedSeatLimit(
  licenseType: LicenseType | null,
): number {
  if (!licenseType) {
    return DEFAULT_SEAT_LIMIT;
  }

  switch (licenseType) {
    case "PLUS":
      return 5;
    case "ORGANIZATION":
      return 50;
    case "ENTERPRISE":
      return MAX_SEAT_LIMIT;
    default:
      return DEFAULT_SEAT_LIMIT;
  }
}

/**
 * Gets the total number of seats available for a space
 * Handles both cloud-hosted (Stripe subscription) and self-hosted (license-based) deployments
 */
export async function getTotalSeatsForSpace(spaceId: string): Promise<number> {
  try {
    if (isSelfHosted) {
      // For self-hosted instances, get seat limit from instance license
      const license = await getInstanceLicense();

      if (!license) {
        // No license found, return default limit
        return DEFAULT_SEAT_LIMIT;
      }

      // If license has explicit seats defined, use that (still capped by MAX_SEAT_LIMIT for safety)
      if (license.seats && license.seats > 0) {
        return Math.min(license.seats, MAX_SEAT_LIMIT);
      }

      // Otherwise, use the license type to determine seat limit
  return getSelfHostedSeatLimit(license.type as LicenseType);
    } else {
      // For cloud-hosted instances, get seat count from Stripe subscription
      const subscription = await getSpaceSubscription(spaceId);

      if (!subscription || !subscription.active) {
        // Return default limit for spaces without active subscriptions
        return DEFAULT_SEAT_LIMIT;
      }

      return subscription.quantity || DEFAULT_SEAT_LIMIT;
    }
  } catch (error) {
    // Log the error for debugging but don't expose internal details
    console.error(`Failed to get total seats for space ${spaceId}:`, error);

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to retrieve seat information",
      cause: error,
    });
  }
}

import Link from "next/link";
import { Trans } from "@/components/trans";
import { getInstanceLicense } from "@/features/licensing/data";
import { getUserCount } from "@/features/user/queries";
import { isSelfHosted } from "@/utils/constants";

export function LicenseLimitWarning() {
  return null;
}

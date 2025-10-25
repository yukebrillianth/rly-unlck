## Self-Hosted Seat / License Override

For simplified self-hosted setups (development, internal evaluation), the application now supports overriding the instance license without needing the `instance_licenses` database table.

Environment variables:

```
NEXT_PUBLIC_SELF_HOSTED=true         # already required for self-hosted mode
SELF_HOSTED_DEFAULT_SEATS=50         # (optional) base seat count without license (default 1)
SELF_HOSTED_MAX_SEATS=999            # (optional) cap for computed seat limits (default 999)
SELF_HOSTED_LICENSE_SEATS=999        # (optional) explicit seat count; falls back to 999
SELF_HOSTED_LICENSE_TYPE=ENTERPRISE  # (optional) PLUS | ORGANIZATION | ENTERPRISE (default ENTERPRISE)
```

Behavior:

* `getInstanceLicense()` returns a mocked license object using the above env vars.
* No Prisma query is performed for `instanceLicense`, avoiding errors if the table/migrations are absent.
* Base seat limit without a license comes from `SELF_HOSTED_DEFAULT_SEATS` (clamped to `SELF_HOSTED_MAX_SEATS`).
* Seat calculations in `getTotalSeatsForSpace` respect `SELF_HOSTED_LICENSE_SEATS` (capped by `SELF_HOSTED_MAX_SEATS`).

If you later add proper licensing tables/migrations, you can replace the simplified implementation in `apps/web/src/features/licensing/data.ts` with a real Prisma query.

Disclaimer: This override is intended for self-hosted development/testing. Remove or adjust before deploying a production SaaS instance that relies on actual licensing enforcement.

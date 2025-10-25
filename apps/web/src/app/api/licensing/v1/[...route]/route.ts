// Simplified licensing API disabled for self-hosted; always return enterprise with 999 seats
import { Hono } from "hono";
import { handle } from "hono/vercel";

const app = new Hono().basePath("/api/licensing/v1");

app.all("*", (c) => {
  return c.json({
    data: {
      key: "FAKE-ENTERPRISE-KEY",
      valid: true,
      status: "ACTIVE",
      issuedAt: new Date().toISOString(),
      expiresAt: null,
      licenseeEmail: null,
      licenseeName: null,
      seats: 999,
      type: "ENTERPRISE",
      version: 1,
    },
  });
});

export const GET = handle(app);
export const POST = handle(app);

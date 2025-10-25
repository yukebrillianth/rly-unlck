import { NextRequest, NextResponse } from "next/server";

function buildRedirectUrl(request: NextRequest) {
  const incomingUrl = new URL(request.url);
  const targetUrl = new URL("/api/auth/callback/google", incomingUrl.origin);
  targetUrl.search = incomingUrl.search;
  return targetUrl;
}

export function GET(request: NextRequest) {
  const targetUrl = buildRedirectUrl(request);
  return NextResponse.redirect(targetUrl, 307);
}

export async function POST(request: NextRequest) {
  const targetUrl = buildRedirectUrl(request);
  return NextResponse.redirect(targetUrl, 307);
}

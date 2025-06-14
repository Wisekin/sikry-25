import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  // Clear the 'auth' cookie (demo only)
  const res = NextResponse.json({ success: true });
  res.cookies.set('auth', '', { maxAge: 0 });
  return res;
}

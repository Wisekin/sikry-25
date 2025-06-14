import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  // Simple mock authentication: check for 'auth' cookie
  const authCookie = req.cookies.get('auth');
if (!authCookie) {
  return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
}
let userData;
try {
  const value = authCookie.value;
  if (value.startsWith('base64-')) {
    const base64String = value.replace('base64-', '');
    const jsonString = Buffer.from(base64String, 'base64').toString('utf-8');
    userData = JSON.parse(jsonString);
  } else {
    userData = JSON.parse(value);
  }
} catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return new NextResponse(JSON.stringify({ error: 'Invalid auth cookie', details: message }), { status: 400 });
  }
}

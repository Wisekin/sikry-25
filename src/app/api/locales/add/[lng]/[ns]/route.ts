import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: { lng: string; ns: string } }
) {
  console.log('API route hit:', { params, url: request.url })
  return NextResponse.json({ success: true, params })
} 
import { NextResponse } from 'next/server';

export async function POST(_request) {
  // NextAuth.js internal logging endpoint
  return NextResponse.json({ success: true });
}

export async function GET(_request) {
  // NextAuth.js internal logging endpoint
  return NextResponse.json({ success: true });
}
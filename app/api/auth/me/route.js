export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request) {
  try {
    const user = await getCurrentUser(request);
    return NextResponse.json({ success: true, user: user || null });
  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

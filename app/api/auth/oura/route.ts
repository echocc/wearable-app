import { NextResponse } from 'next/server';
import { OuraClient } from '@/lib/oura';
import { randomBytes } from 'crypto';

export async function GET() {
  try {
    // Generate a random state for CSRF protection
    const state = randomBytes(32).toString('hex');

    // Get the Oura authorization URL
    const authUrl = OuraClient.getAuthorizationUrl(state);

    // Create response with redirect
    const response = NextResponse.redirect(authUrl);

    // Store state in cookie for verification in callback
    response.cookies.set('oura_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
    });

    return response;
  } catch (error) {
    console.error('Error initiating Oura OAuth:', error);
    return NextResponse.json(
      { error: 'Failed to initiate OAuth flow' },
      { status: 500 }
    );
  }
}

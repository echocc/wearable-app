import { NextRequest, NextResponse } from 'next/server';
import { OuraClient } from '@/lib/oura';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Check for OAuth errors
    if (error) {
      return NextResponse.redirect(
        new URL(`/?error=${encodeURIComponent(error)}`, request.url)
      );
    }

    // Validate required parameters
    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/?error=missing_parameters', request.url)
      );
    }

    // Verify state matches what we sent (CSRF protection)
    const savedState = request.cookies.get('oura_oauth_state')?.value;
    if (!savedState || savedState !== state) {
      return NextResponse.redirect(
        new URL('/?error=invalid_state', request.url)
      );
    }

    // Exchange authorization code for access token
    const tokenResponse = await OuraClient.exchangeCodeForToken(code);

    // Get user's personal info from Oura
    const ouraClient = new OuraClient(tokenResponse.access_token);
    const personalInfo = await ouraClient.getPersonalInfo();

    // Calculate token expiration time
    const expiresAt = new Date(Date.now() + tokenResponse.expires_in * 1000);

    // Store or update user in database
    const result = await query(
      `INSERT INTO users (oura_user_id, email, access_token, refresh_token, token_expires_at)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (oura_user_id)
       DO UPDATE SET
         access_token = $3,
         refresh_token = $4,
         token_expires_at = $5,
         updated_at = CURRENT_TIMESTAMP
       RETURNING id, email`,
      [
        personalInfo.id,
        personalInfo.email,
        tokenResponse.access_token,
        tokenResponse.refresh_token,
        expiresAt,
      ]
    );

    const user = result.rows[0];

    // Create response and set session cookie
    const response = NextResponse.redirect(new URL('/', request.url));

    response.cookies.set('user_id', user.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    // Clear the OAuth state cookie
    response.cookies.delete('oura_oauth_state');

    return response;
  } catch (error) {
    console.error('Error in Oura OAuth callback:', error);
    return NextResponse.redirect(
      new URL('/?error=oauth_failed', request.url)
    );
  }
}

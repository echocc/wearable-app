import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { query } from '@/lib/db';

/**
 * Get stored Oura data for the authenticated user
 * Query params: days (default 30), type (sleep, activity, readiness, all)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '30');
    const type = searchParams.get('type') || 'all';

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const data: any = {};

    // Fetch sleep data
    if (type === 'all' || type === 'sleep') {
      const sleepResult = await query(
        `SELECT day, score, contributors, raw_data
         FROM daily_sleep
         WHERE user_id = $1 AND day >= $2
         ORDER BY day DESC`,
        [user.id, startDate]
      );
      data.sleep = sleepResult.rows;
    }

    // Fetch activity data
    if (type === 'all' || type === 'activity') {
      const activityResult = await query(
        `SELECT day, score, active_calories, steps, contributors, raw_data
         FROM daily_activity
         WHERE user_id = $1 AND day >= $2
         ORDER BY day DESC`,
        [user.id, startDate]
      );
      data.activity = activityResult.rows;
    }

    // Fetch readiness data
    if (type === 'all' || type === 'readiness') {
      const readinessResult = await query(
        `SELECT day, score, temperature_deviation, contributors, raw_data
         FROM daily_readiness
         WHERE user_id = $1 AND day >= $2
         ORDER BY day DESC`,
        [user.id, startDate]
      );
      data.readiness = readinessResult.rows;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching Oura data:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch Oura data' },
      { status: 500 }
    );
  }
}

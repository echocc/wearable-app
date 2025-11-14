import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { OuraClient } from '@/lib/oura';
import { query } from '@/lib/db';

/**
 * Sync Oura data for the authenticated user
 * Fetches last 30 days of sleep, activity, and readiness data
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    // Get date range (last 30 days)
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const ouraClient = new OuraClient(user.access_token);

    // Fetch data from Oura API
    const [sleepData, activityData, readinessData] = await Promise.all([
      ouraClient.getDailySleep(startDate, endDate),
      ouraClient.getDailyActivity(startDate, endDate),
      ouraClient.getDailyReadiness(startDate, endDate),
    ]);

    // Store sleep data
    if (sleepData.data && sleepData.data.length > 0) {
      for (const record of sleepData.data) {
        await query(
          `INSERT INTO daily_sleep (id, user_id, day, score, timestamp, contributors, raw_data)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (user_id, day)
           DO UPDATE SET
             score = $4,
             timestamp = $5,
             contributors = $6,
             raw_data = $7`,
          [
            record.id,
            user.id,
            record.day,
            record.score,
            record.timestamp,
            JSON.stringify(record.contributors || {}),
            JSON.stringify(record),
          ]
        );
      }
    }

    // Store activity data
    if (activityData.data && activityData.data.length > 0) {
      for (const record of activityData.data) {
        await query(
          `INSERT INTO daily_activity (id, user_id, day, score, active_calories, steps, timestamp, contributors, raw_data)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (user_id, day)
           DO UPDATE SET
             score = $4,
             active_calories = $5,
             steps = $6,
             timestamp = $7,
             contributors = $8,
             raw_data = $9`,
          [
            record.id,
            user.id,
            record.day,
            record.score,
            record.active_calories,
            record.steps,
            record.timestamp,
            JSON.stringify(record.contributors || {}),
            JSON.stringify(record),
          ]
        );
      }
    }

    // Store readiness data
    if (readinessData.data && readinessData.data.length > 0) {
      for (const record of readinessData.data) {
        await query(
          `INSERT INTO daily_readiness (id, user_id, day, score, temperature_deviation, timestamp, contributors, raw_data)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (user_id, day)
           DO UPDATE SET
             score = $4,
             temperature_deviation = $5,
             timestamp = $6,
             contributors = $7,
             raw_data = $8`,
          [
            record.id,
            user.id,
            record.day,
            record.score,
            record.temperature_deviation,
            record.timestamp,
            JSON.stringify(record.contributors || {}),
            JSON.stringify(record),
          ]
        );
      }
    }

    return NextResponse.json({
      success: true,
      synced: {
        sleep: sleepData.data?.length || 0,
        activity: activityData.data?.length || 0,
        readiness: readinessData.data?.length || 0,
      },
    });
  } catch (error) {
    console.error('Error syncing Oura data:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to sync Oura data' },
      { status: 500 }
    );
  }
}

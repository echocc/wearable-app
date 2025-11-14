import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { query } from '@/lib/db';
import { generateHealthInsight, type ChatMessage } from '@/lib/claude';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { message, includeHistory = true } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get recent health data (last 30 days)
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const [sleepResult, activityResult, readinessResult] = await Promise.all([
      query(
        `SELECT day, score, contributors, raw_data
         FROM daily_sleep
         WHERE user_id = $1 AND day >= $2
         ORDER BY day DESC
         LIMIT 30`,
        [user.id, startDate]
      ),
      query(
        `SELECT day, score, active_calories, steps, contributors, raw_data
         FROM daily_activity
         WHERE user_id = $1 AND day >= $2
         ORDER BY day DESC
         LIMIT 30`,
        [user.id, startDate]
      ),
      query(
        `SELECT day, score, temperature_deviation, contributors, raw_data
         FROM daily_readiness
         WHERE user_id = $1 AND day >= $2
         ORDER BY day DESC
         LIMIT 30`,
        [user.id, startDate]
      ),
    ]);

    // Prepare health data context
    const healthData = {
      sleep: sleepResult.rows,
      activity: activityResult.rows,
      readiness: readinessResult.rows,
    };

    // Get conversation history if requested
    let conversationHistory: ChatMessage[] = [];
    if (includeHistory) {
      const historyResult = await query(
        `SELECT role, content
         FROM chat_history
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT 10`,
        [user.id]
      );
      conversationHistory = historyResult.rows.reverse();
    }

    // Generate response from Claude
    const response = await generateHealthInsight(
      message,
      healthData,
      conversationHistory
    );

    // Store user message and assistant response in chat history
    await Promise.all([
      query(
        `INSERT INTO chat_history (user_id, role, content)
         VALUES ($1, $2, $3)`,
        [user.id, 'user', message]
      ),
      query(
        `INSERT INTO chat_history (user_id, role, content)
         VALUES ($1, $2, $3)`,
        [user.id, 'assistant', response]
      ),
    ]);

    return NextResponse.json({
      message: response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in chat endpoint:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}

/**
 * Get chat history for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');

    const result = await query(
      `SELECT role, content, created_at
       FROM chat_history
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [user.id, limit]
    );

    return NextResponse.json({
      messages: result.rows.reverse(),
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch chat history' },
      { status: 500 }
    );
  }
}

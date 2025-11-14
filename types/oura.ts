export interface OuraUser {
  id: number;
  oura_user_id: string;
  email: string;
  access_token: string;
  refresh_token: string;
  token_expires_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface DailySleep {
  id: string;
  user_id: number;
  day: string;
  score: number | null;
  timestamp: string;
  contributors: {
    deep_sleep?: number;
    efficiency?: number;
    latency?: number;
    rem_sleep?: number;
    restfulness?: number;
    timing?: number;
    total_sleep?: number;
  };
  raw_data: any;
  created_at: Date;
}

export interface DailyActivity {
  id: string;
  user_id: number;
  day: string;
  score: number | null;
  active_calories: number;
  steps: number;
  timestamp: string;
  contributors: {
    meet_daily_targets?: number;
    move_every_hour?: number;
    recovery_time?: number;
    stay_active?: number;
    training_frequency?: number;
    training_volume?: number;
  };
  raw_data: any;
  created_at: Date;
}

export interface DailyReadiness {
  id: string;
  user_id: number;
  day: string;
  score: number | null;
  temperature_deviation: number | null;
  timestamp: string;
  contributors: {
    activity_balance?: number;
    body_temperature?: number;
    hrv_balance?: number;
    previous_day_activity?: number;
    previous_night?: number;
    recovery_index?: number;
    resting_heart_rate?: number;
    sleep_balance?: number;
  };
  raw_data: any;
  created_at: Date;
}

export interface ChatHistory {
  id: number;
  user_id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: Date;
}

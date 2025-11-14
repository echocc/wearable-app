const OURA_API_BASE = 'https://api.ouraring.com/v2';
const OURA_AUTH_BASE = 'https://cloud.ouraring.com/oauth';

export interface OuraTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}

export class OuraClient {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /**
   * Get OAuth authorization URL
   */
  static getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: process.env.OURA_CLIENT_ID!,
      redirect_uri: process.env.OURA_REDIRECT_URI!,
      scope: 'email personal daily heartrate workout session',
      state,
    });
    return `${OURA_AUTH_BASE}/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  static async exchangeCodeForToken(code: string): Promise<OuraTokenResponse> {
    const response = await fetch(`${OURA_AUTH_BASE}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.OURA_REDIRECT_URI!,
        client_id: process.env.OURA_CLIENT_ID!,
        client_secret: process.env.OURA_CLIENT_SECRET!,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to exchange code for token: ${error}`);
    }

    return response.json();
  }

  /**
   * Generic method to fetch data from Oura API
   */
  private async fetch<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${OURA_API_BASE}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Oura API error: ${error}`);
    }

    return response.json();
  }

  /**
   * Get personal info
   */
  async getPersonalInfo() {
    return this.fetch('/usercollection/personal_info');
  }

  /**
   * Get daily sleep data
   */
  async getDailySleep(startDate?: string, endDate?: string) {
    const params: Record<string, string> = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    return this.fetch('/usercollection/daily_sleep', params);
  }

  /**
   * Get daily activity data
   */
  async getDailyActivity(startDate?: string, endDate?: string) {
    const params: Record<string, string> = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    return this.fetch('/usercollection/daily_activity', params);
  }

  /**
   * Get daily readiness data
   */
  async getDailyReadiness(startDate?: string, endDate?: string) {
    const params: Record<string, string> = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    return this.fetch('/usercollection/daily_readiness', params);
  }

  /**
   * Get heart rate data
   */
  async getHeartRate(startDate?: string, endDate?: string) {
    const params: Record<string, string> = {};
    if (startDate) params.start_datetime = startDate;
    if (endDate) params.end_datetime = endDate;
    return this.fetch('/usercollection/heartrate', params);
  }

  /**
   * Get workout data
   */
  async getWorkouts(startDate?: string, endDate?: string) {
    const params: Record<string, string> = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    return this.fetch('/usercollection/workout', params);
  }

  /**
   * Get session data
   */
  async getSessions(startDate?: string, endDate?: string) {
    const params: Record<string, string> = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    return this.fetch('/usercollection/session', params);
  }

  /**
   * Get daily stress data
   */
  async getDailyStress(startDate?: string, endDate?: string) {
    const params: Record<string, string> = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    return this.fetch('/usercollection/daily_stress', params);
  }
}

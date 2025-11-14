import { cookies } from 'next/headers';
import { query } from './db';
import type { OuraUser } from '@/types/oura';

export async function getCurrentUser(): Promise<OuraUser | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get('user_id')?.value;

  if (!userId) {
    return null;
  }

  try {
    const result = await query(
      'SELECT * FROM users WHERE id = $1',
      [parseInt(userId)]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0] as OuraUser;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
}

export async function requireAuth(): Promise<OuraUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

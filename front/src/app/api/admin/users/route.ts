// app/api/admin/users/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { checkAuth } from '@/utils/check_auth';

export async function GET(request:Request) {
  const resp = await checkAuth(request)
  if (resp) return resp;
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT id, tg_username, role, chat_id 
      FROM users 
      ORDER BY tg_username
    `);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  } finally {
    client.release();
  }
}
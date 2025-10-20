// app/api/admin/users/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { checkAuth } from '@/utils/check_auth';

export async function GET(request: Request) {
  const resp = await checkAuth(request)
  if (resp) {
    return resp
  }
  
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT 
        u.id,
        u.tg_username,
        u.chat_id,
        u.relation_id,
        ARRAY_AGG(ur.role) as roles
      FROM users u
      LEFT JOIN users_roles ur ON u.id = ur.user_id
      GROUP BY u.id, u.tg_username, u.chat_id, u.relation_id
      ORDER BY u.tg_username
    `);
    
    const users = result.rows.map(row => ({
      id: row.id,
      tg_username: row.tg_username,
      chat_id: row.chat_id,
      relation_id: row.relation_id,
      roles: row.roles.filter((role: string) => role !== null)
    }));
    
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  } finally {
    client.release();
  }
}
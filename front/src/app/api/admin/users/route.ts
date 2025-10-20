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
    // Альтернативный запрос без ARRAY_AGG
    const result = await client.query(`
      SELECT 
        u.id,
        u.tg_username,
        u.chat_id,
        u.relation_id,
        (
          SELECT JSON_AGG(ur.role)
          FROM users_roles ur 
          WHERE ur.user_id = u.id AND ur.role IS NOT NULL
        ) as roles
      FROM users u
      ORDER BY u.tg_username
    `);
    
    const users = result.rows.map(row => {
      // Обрабатываем roles как JSON массив
      let roles: string[] = [];
      
      if (row.roles && typeof row.roles === 'string') {
        // Если это JSON строка, парсим её
        try {
          roles = JSON.parse(row.roles);
        } catch (e) {
          console.error('Error parsing roles JSON:', e);
        }
      } else if (Array.isArray(row.roles)) {
        // Если это уже массив
        roles = row.roles;
      }
      
      // Убедимся, что roles всегда массив
      if (!Array.isArray(roles)) {
        roles = [];
      }
      
      return {
        id: row.id,
        tg_username: row.tg_username,
        chat_id: row.chat_id,
        relation_id: row.relation_id,
        roles: roles
      };
    });
    
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  } finally {
    client.release();
  }
}
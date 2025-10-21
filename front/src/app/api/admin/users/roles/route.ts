// app/api/admin/users/roles/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { checkAuth } from '@/utils/check_auth';

export async function PUT(request: Request) {
  const resp = await checkAuth(request)
  if (resp) {
    return resp
  }
  
  const client = await pool.connect();
  try {
    const { users, currentUsername } = await request.json();
    
    // Получаем ID текущего пользователя по username
    const currentUserResult = await client.query(
      'SELECT id FROM users WHERE tg_username = $1',
      [currentUsername]
    );
    
    if (currentUserResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Current user not found' },
        { status: 400 }
      );
    }
    
    const currentUserId = currentUserResult.rows[0].id;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentUser = users.find((user: any) => user.id === currentUserId);
    if (currentUser && !currentUser.roles.includes('ADMIN')) {
      return NextResponse.json(
        { error: 'Нельзя удалить у себя права администратора' },
        { status: 400 }
      );
    }

    // Проверяем, что у всех пользователей есть хотя бы одна роль
    for (const user of users) {
      if (!user.roles || user.roles.length === 0) {
        return NextResponse.json(
          { error: `Пользователь ${user.tg_username} должен иметь хотя бы одну роль` },
          { status: 400 }
        );
      }
    }

    await client.query('BEGIN');
    
    for (const user of users) {
      // Удаляем все текущие роли пользователя
      await client.query('DELETE FROM users_roles WHERE user_id = $1', [user.id]);
      
      // Добавляем новые роли с указанием всех обязательных полей
      for (const role of user.roles) {
        await client.query(
          `INSERT INTO users_roles (id, user_id, role, created_at, updated_at) 
           VALUES (gen_random_uuid(), $1, $2, NOW(), NOW())`,
          [user.id, role]
        );
      }
    }
    
    await client.query('COMMIT');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating roles:', error);
    return NextResponse.json({ error: 'Failed to update roles' }, { status: 500 });
  } finally {
    client.release();
  }
}
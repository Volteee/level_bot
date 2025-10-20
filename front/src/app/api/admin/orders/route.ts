// app/api/admin/orders/route.ts
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
    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state');
    
    let query = `
      SELECT 
        o.*,
        u.tg_username as initiator_username,
        u.chat_id as initiator_chat_id
      FROM orders o
      LEFT JOIN users u ON o.initiator_id = u.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    if (state) {
      query += ` AND o.state = $1`;
      params.push(state);
    }
    
    query += ` ORDER BY o.created_at DESC`;
    
    const result = await client.query(query, params);
    
    // Получаем файлы для каждой заявки
    const ordersWithFiles = await Promise.all(
      result.rows.map(async (row) => {
        const filesResult = await client.query(
          'SELECT * FROM files WHERE order_id = $1 ORDER BY created_at',
          [row.id]
        );
        
        return {
          id: row.id,
          level: row.level,
          step: row.step,
          state: row.state,
          initiator_id: row.initiator_id,
          description: row.description,
          reply: row.reply,
          amount: row.amount,
          currency: row.currency,
          created_at: row.created_at,
          updated_at: row.updated_at,
          initiator: {
            id: row.initiator_id,
            tg_username: row.initiator_username,
            chat_id: row.initiator_chat_id
          },
          files: filesResult.rows
        };
      })
    );
    
    return NextResponse.json(ordersWithFiles);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  } finally {
    client.release();
  }
}
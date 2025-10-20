// app/api/admin/orders/files/route.ts
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
    const orderId = searchParams.get('orderId');
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }
    
    const result = await client.query(
      'SELECT * FROM files WHERE order_id = $1 ORDER BY created_at',
      [orderId]
    );
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 });
  } finally {
    client.release();
  }
}
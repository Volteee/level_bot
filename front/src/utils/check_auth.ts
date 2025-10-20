// app/utils/check_auth.ts
import { parse, isValid } from '@tma.js/init-data-node';
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

const bot_token = String(process.env.BOT_TOKEN)

export async function checkAuth(request: Request) {
    const initData = String(request.headers.get('initData'))
    const isInitDataValid = isValid(
        initData,
        bot_token,
    );
    if (!isInitDataValid) {
        return NextResponse.json(
            { error: 'Forbidden' }, 
            { status: 403 }
        );
    }
    const username = parse(initData).user?.username;
    if (!username) {
        return NextResponse.json(
            { error: 'Forbidden' }, 
            { status: 403 }
        );
    }
    const client = await pool.connect();
    try {
        const result = await client.query(`
            SELECT ARRAY_AGG(ur.role) as roles 
            FROM users u
            LEFT JOIN users_roles ur ON u.id = ur.user_id
            WHERE u.tg_username = $1
            GROUP BY u.id
        `, [username]);
        
        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: 'User not found' }, 
                { status: 403 }
            );
        }
        
        const roles = result.rows[0].roles.filter((role: string) => role !== null);
        
        if (!roles.includes('ADMIN')) {
            return NextResponse.json(
                { error: 'Forbidden - Admin access required' }, 
                { status: 403 }
            );
        }
        
        return null;
    } catch (error) {
        console.error('Error checking auth:', error);
        return NextResponse.json(
            { error: 'Failed to check user role' }, 
            { status: 500 }
        );
    } finally {
        client.release();
    }
}
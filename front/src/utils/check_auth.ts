import { parse, isValid } from '@telegram-apps/init-data-node';
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

const bot_token = String(process.env.BOT_TOKEN)

export async function checkAuth(request:Request) {
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
        const result = await client.query(
            'SELECT role FROM users WHERE tg_username = $1',
            [username]
        );
        if (String(result.rows[0]['role']) != 'ADMIN'){
            return NextResponse.json(
                { error: 'Forbidden' }, 
                { status: 403 }
            );
        }
        return null;
    } catch (error) {
        console.error('Error fetching conditions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user role' }, 
            { status: 500 }
        );
    } finally {
        client.release();
    }
}
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
            { error: 'Forbidden - Invalid init data' }, 
            { status: 403 }
        );
    }
    const parsedData = parse(initData);
    const username = parsedData.user?.username;
    if (!username) {
        return NextResponse.json(
            { error: 'Forbidden - No username' }, 
            { status: 403 }
        );
    }
    const client = await pool.connect();
    try {
        const userCheck = await client.query(
            'SELECT id FROM users WHERE tg_username = $1',
            [username]
        );
        if (userCheck.rows.length === 0) {
            return NextResponse.json(
                { error: 'User not found in system' }, 
                { status: 403 }
            );
        }
        const rolesResult = await client.query(`
            SELECT ur.role 
            FROM users_roles ur 
            WHERE ur.user_id = $1
        `, [userCheck.rows[0].id]);
        const roles = rolesResult.rows.map(row => row.role);
        const hasAdminRole = roles.includes('ADMIN');
        if (!hasAdminRole) {
            return NextResponse.json(
                { error: 'Forbidden - Admin access required. Your roles: ' + roles.join(', ') }, 
                { status: 403 }
            );
        }
        return null;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to check user role' }, 
            { status: 500 }
        );
    } finally {
        client.release();
    }
}
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { parseQueryIntent } from '@/lib/query/nl-parser';
import { generateSafeSQL } from '@/lib/query/sql-generator';
import { formatQueryResult } from '@/lib/query/result-formatter';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { question } = await req.json();
        if (!question) {
            return NextResponse.json({ error: 'Question is required' }, { status: 400 });
        }

        // 1. Parse Intent
        const intent = await parseQueryIntent(question);

        // 2. Generate SQL
        const sql = generateSafeSQL(intent, user.id);

        // 3. Execute SQL via RPC
        const { data, error: sqlError } = await supabase.rpc('exec_sql', {
            query_text: sql
        });

        if (sqlError) {
            console.error('SQL Execution Error:', sqlError);
            return NextResponse.json({
                error: 'Failed to execute query',
                details: sqlError.message
            }, { status: 500 });
        }

        // 4. Format Results
        const answer = await formatQueryResult(data, question);

        return NextResponse.json({
            answer,
            data,
            sql: process.env.NODE_ENV === 'development' ? sql : undefined,
            intent
        });
    } catch (error: any) {
        console.error('Query API Error:', error);
        return NextResponse.json({
            error: 'Internal server error',
            message: error.message
        }, { status: 500 });
    }
}

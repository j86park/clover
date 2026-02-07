import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendEmailAlert } from '@/lib/alerts';

/**
 * POST /api/alerts/test
 * Send a test alert email to verify configuration
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { destination } = body as { destination: string };

        if (!destination) {
            return NextResponse.json({ error: 'Email destination is required' }, { status: 400 });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(destination)) {
            return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
        }

        // Send test email with sample data
        const result = await sendEmailAlert({
            to: destination,
            brandName: 'Test Brand',
            triggers: [
                {
                    type: 'asov_drop',
                    message: 'This is a test alert to verify your email configuration is working correctly. Your actual alerts will include real metric changes.',
                    current_value: 35,
                    previous_value: 42,
                    threshold: 10,
                },
            ],
        });

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || 'Failed to send test email' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, message: 'Test email sent successfully' });
    } catch (error) {
        console.error('POST /api/alerts/test error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

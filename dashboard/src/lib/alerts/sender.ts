/**
 * Alert Email Sender
 * Sends branded email alerts via Resend API
 */

import { Resend } from 'resend';
import type { AlertTriggerResult } from '@/types/alerts';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Default from address (must be verified in Resend dashboard)
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'alerts@updates.clover.dev';

export interface SendAlertOptions {
    to: string;
    brandName: string;
    triggers: AlertTriggerResult[];
    dashboardUrl?: string;
}

/**
 * Send an alert email via Resend
 */
export async function sendEmailAlert(options: SendAlertOptions): Promise<{ success: boolean; error?: string }> {
    const { to, brandName, triggers, dashboardUrl = 'https://clover.dev' } = options;

    if (!process.env.RESEND_API_KEY) {
        console.warn('[Alerts] RESEND_API_KEY not configured, skipping email');
        return { success: false, error: 'RESEND_API_KEY not configured' };
    }

    const subject = `⚠️ Clover Alert: ${brandName} - ${triggers.length} metric change${triggers.length > 1 ? 's' : ''} detected`;

    const html = generateEmailHtml({ brandName, triggers, dashboardUrl });

    try {
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: [to],
            subject,
            html,
        });

        if (error) {
            console.error('[Alerts] Resend error:', error);
            return { success: false, error: error.message };
        }

        console.log('[Alerts] Email sent successfully:', data?.id);
        return { success: true };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('[Alerts] Failed to send email:', message);
        return { success: false, error: message };
    }
}

/**
 * Generate the HTML email body with Clover branding
 */
function generateEmailHtml(options: {
    brandName: string;
    triggers: AlertTriggerResult[];
    dashboardUrl: string;
}): string {
    const { brandName, triggers, dashboardUrl } = options;

    const triggerRows = triggers
        .map(
            (trigger) => `
            <tr>
                <td style="padding: 16px; border-bottom: 1px solid #1a3a2a;">
                    <div style="font-weight: 600; color: #10b981; margin-bottom: 4px;">
                        ${getAlertIcon(trigger.type)} ${formatTriggerLabel(trigger.type)}
                    </div>
                    <div style="color: #d1d5db; font-size: 14px;">
                        ${trigger.message}
                    </div>
                </td>
            </tr>
        `
        )
        .join('');

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #10b981; font-size: 28px; margin: 0;">🍀 Clover</h1>
            <p style="color: #6b7280; font-size: 14px; margin-top: 8px;">AI Brand Visibility Dashboard</p>
        </div>

        <!-- Alert Card -->
        <div style="background-color: #111111; border: 1px solid #1a3a2a; border-radius: 16px; overflow: hidden;">
            <!-- Card Header -->
            <div style="background: linear-gradient(135deg, #064e3b 0%, #0d3a2a 100%); padding: 24px; text-align: center;">
                <h2 style="color: #ffffff; font-size: 20px; margin: 0;">
                    ⚠️ Alert for ${brandName}
                </h2>
                <p style="color: #a7f3d0; font-size: 14px; margin-top: 8px;">
                    We detected ${triggers.length} significant metric change${triggers.length > 1 ? 's' : ''}
                </p>
            </div>

            <!-- Alert Details -->
            <table style="width: 100%; border-collapse: collapse;">
                ${triggerRows}
            </table>

            <!-- CTA Button -->
            <div style="padding: 24px; text-align: center;">
                <a href="${dashboardUrl}" 
                   style="display: inline-block; background-color: #10b981; color: #ffffff; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px;">
                    View Dashboard →
                </a>
            </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 32px; color: #6b7280; font-size: 12px;">
            <p style="margin: 0;">
                You're receiving this because you enabled alerts for ${brandName}.
            </p>
            <p style="margin-top: 8px;">
                <a href="${dashboardUrl}/settings/alerts" style="color: #10b981; text-decoration: none;">
                    Manage alert preferences
                </a>
            </p>
        </div>
    </div>
</body>
</html>
    `.trim();
}

function formatTriggerLabel(type: string): string {
    const labels: Record<string, string> = {
        asov_drop: 'ASoV Drop Detected',
        competitor_overtake: 'Competitor Overtake',
        sentiment_negative: 'Sentiment Turned Negative',
        new_citation_source: 'New Citation Sources',
    };
    return labels[type] || type;
}

function getAlertIcon(type: string): string {
    const icons: Record<string, string> = {
        asov_drop: '📉',
        competitor_overtake: '🏃',
        sentiment_negative: '😟',
        new_citation_source: '📎',
    };
    return icons[type] || '⚠️';
}

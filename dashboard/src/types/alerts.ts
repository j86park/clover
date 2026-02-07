/**
 * Alert Configuration Types
 * For email notifications when metrics change significantly
 */

export type AlertChannel = 'email';

export type AlertTriggerType =
    | 'asov_drop'
    | 'competitor_overtake'
    | 'sentiment_negative'
    | 'new_citation_source';

export interface AlertTriggers {
    asov_drop_percent?: number;      // e.g., 10 = alert if ASoV drops by 10%
    competitor_overtake?: boolean;   // alert if a competitor overtakes your brand
    sentiment_negative?: boolean;    // alert if sentiment score turns negative
    new_citation_source?: boolean;   // alert on new citation source detected
}

export interface AlertConfig {
    id: string;
    user_id: string;
    brand_id: string;
    channel: AlertChannel;
    destination: string; // recipient email address
    triggers: AlertTriggers;
    is_active: boolean;
    created_at: string;
    last_triggered_at?: string | null;
}

export interface AlertLog {
    id: string;
    alert_config_id: string;
    trigger_type: AlertTriggerType;
    message: string;
    sent_at: string;
    status: 'sent' | 'failed';
    error_message?: string | null;
}

export interface AlertTriggerResult {
    type: AlertTriggerType;
    message: string;
    current_value?: number;
    previous_value?: number;
    threshold?: number;
}

// Database row types (for Supabase queries)
export interface AlertConfigRow {
    id: string;
    user_id: string;
    brand_id: string;
    channel: AlertChannel;
    destination: string;
    triggers: AlertTriggers;
    is_active: boolean;
    created_at: string;
    last_triggered_at: string | null;
}

export interface AlertLogRow {
    id: string;
    alert_config_id: string;
    trigger_type: string;
    message: string;
    sent_at: string;
    status: string;
    error_message: string | null;
}

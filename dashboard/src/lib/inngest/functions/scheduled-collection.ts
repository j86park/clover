/**
 * Scheduled Collection Inngest Function
 * Runs on cron to check and execute due scheduled collections
 */

import { inngest } from "../client";
import { createServiceClient } from "@/lib/supabase/service";
import type { CollectionSchedule } from "@/types";

/**
 * Calculate next run time based on schedule configuration
 */
function calculateNextRun(schedule: CollectionSchedule): Date {
    const now = new Date();
    const [hours, minutes] = schedule.time_utc.split(':').map(Number);

    const nextRun = new Date(now);
    nextRun.setUTCHours(hours, minutes, 0, 0);

    if (schedule.schedule_type === 'daily') {
        // If time already passed today, schedule for tomorrow
        if (nextRun <= now) {
            nextRun.setUTCDate(nextRun.getUTCDate() + 1);
        }
    } else if (schedule.schedule_type === 'weekly') {
        const targetDay = schedule.day_of_week ?? 1; // Default Monday
        const currentDay = nextRun.getUTCDay();

        // Calculate days until target day
        let daysUntil = targetDay - currentDay;
        if (daysUntil < 0) daysUntil += 7;
        if (daysUntil === 0 && nextRun <= now) daysUntil = 7;

        nextRun.setUTCDate(nextRun.getUTCDate() + daysUntil);
    }

    return nextRun;
}

/**
 * Scheduled Collection Checker
 * Runs every 15 minutes to check for due scheduled collections
 */
export const scheduledCollectionChecker = inngest.createFunction(
    {
        id: "scheduled-collection-checker",
        name: "Scheduled Collection Checker",
    },
    { cron: "*/15 * * * *" }, // Every 15 minutes
    async ({ step }) => {
        const supabase = createServiceClient();

        // 1. Find all due schedules
        const dueSchedules = await step.run("find-due-schedules", async () => {
            const now = new Date().toISOString();

            const { data: schedules, error } = await supabase
                .from('schedules')
                .select('*')
                .eq('is_active', true)
                .lte('next_run_at', now);

            if (error) {
                console.error('[Scheduler] Error fetching schedules:', error);
                return [];
            }

            return (schedules || []) as CollectionSchedule[];
        });

        if (dueSchedules.length === 0) {
            return { message: 'No scheduled collections due', triggered: 0 };
        }

        console.log(`[Scheduler] Found ${dueSchedules.length} due schedules`);

        // 2. Trigger collection for each due schedule
        let triggered = 0;

        for (const schedule of dueSchedules) {
            await step.run(`trigger-${schedule.id.slice(0, 8)}`, async () => {
                // Get brand info for models
                const { data: brand } = await supabase
                    .from('brands')
                    .select('id, name')
                    .eq('id', schedule.brand_id)
                    .single();

                if (!brand) {
                    console.error(`[Scheduler] Brand ${schedule.brand_id} not found`);
                    return;
                }

                // Create collection record
                const { data: collection, error: collectionError } = await supabase
                    .from('collections')
                    .insert({
                        brand_id: schedule.brand_id,
                        status: 'pending',
                        started_at: new Date().toISOString(),
                    })
                    .select()
                    .single();

                if (collectionError || !collection) {
                    console.error('[Scheduler] Failed to create collection:', collectionError);
                    return;
                }

                // Trigger the collection via Inngest event
                await inngest.send({
                    name: 'collection.start',
                    data: {
                        brandId: schedule.brand_id,
                        models: ['gpt-4o', 'claude-sonnet'], // Default models
                        promptIds: [], // All active prompts
                        collectionId: collection.id,
                    },
                });

                // Update schedule times
                const nextRun = calculateNextRun(schedule);

                await supabase
                    .from('schedules')
                    .update({
                        last_run_at: new Date().toISOString(),
                        next_run_at: nextRun.toISOString(),
                    })
                    .eq('id', schedule.id);

                triggered++;
                console.log(`[Scheduler] Triggered collection for brand ${brand.name}`);
            });
        }

        return {
            message: `Triggered ${triggered} scheduled collections`,
            triggered,
        };
    }
);

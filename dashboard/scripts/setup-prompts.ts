import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Helper to load .env.local
function loadEnv() {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            const [key, ...valueParts] = line.split('=');
            if (key && valueParts.length > 0) {
                const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
                process.env[key.trim()] = value;
            }
        });
    }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setup() {
    console.log('🚀 Setting up global prompts and migrating specific ones...');

    // 1. Get the first user to assign existing specific prompts to
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
    const firstUser = users?.[0];

    if (userError || !firstUser) {
        console.warn('⚠️ No users found. Specific prompts might remain global or have issues.');
    }

    // 2. Fetch all current prompts to check for duplicates
    const { data: existingPrompts, error: fetchError } = await supabase.from('prompts').select('*');
    if (fetchError) {
        console.error('Error fetching prompts:', fetchError);
        return;
    }

    // 3. Insert Generic Global Defaults (user_id = NULL)
    const globalPrompts = [
        {
            category: 'comparison',
            intent: 'Comprehensive Feature/Pricing Audit',
            template: 'How does {brand} compare to {competitor} in terms of features, pricing, and overall value?',
            is_active: true,
            user_id: null
        },
        {
            category: 'comparison',
            intent: 'Business Growth Comparison',
            template: 'What are the main pros and cons of using {brand} versus {competitor} for a growing business?',
            is_active: true,
            user_id: null
        },
        {
            category: 'comparison',
            intent: 'Scalability & Usability Check',
            template: 'Which is better for long-term scalability and ease of use: {brand} or {competitor}?',
            is_active: true,
            user_id: null
        },
        {
            category: 'discovery',
            intent: 'Generic Market Discovery',
            template: 'What are the top solutions in the {category} space for businesses in 2024?',
            is_active: true,
            user_id: null
        }
    ];

    for (const p of globalPrompts) {
        const exists = existingPrompts?.find(ex => ex.template === p.template && ex.user_id === null);
        if (!exists) {
            const { error: insertError } = await supabase.from('prompts').insert(p);
            if (insertError) console.error(`Error inserting global prompt "${p.intent}":`, insertError);
            else console.log(`✅ Added global default: ${p.intent}`);
        } else {
            console.log(`ℹ️ Global default already exists: ${p.intent}`);
        }
    }

    // 4. Update Clover-specific prompts to belong to the first user
    // We identify them by their specific "GTM" or "RedRover" keywords
    if (firstUser) {
        const cloverTemplates = [
            'What are the top AI agents for automating GTM distribution and revenue growth in 2024?',
            'How does {brand} compare to {competitor} for autonomous growth and distribution automation?',
            'Is RedRover from {brand} better than {competitor} for AI-powered Reddit marketing and lead generation?'
        ];

        for (const template of cloverTemplates) {
            const matches = existingPrompts?.filter(ex => ex.template === template);
            if (matches && matches.length > 0) {
                // Update primary one to have user_id
                const primary = matches[0];
                const { error: updateError } = await supabase
                    .from('prompts')
                    .update({ user_id: firstUser.id })
                    .eq('id', primary.id);

                if (updateError) console.error(`Error assigning prompt to user ${firstUser.email}:`, updateError);
                else console.log(`✅ Assigned prompt to user ${firstUser.email}: ${template.slice(0, 30)}...`);

                // Deactivate duplicates if any (safer than deleting due to FK)
                if (matches.length > 1) {
                    const duplicateIds = matches.slice(1).map(m => m.id);
                    const { error: deactivateError } = await supabase
                        .from('prompts')
                        .update({ is_active: false })
                        .in('id', duplicateIds);

                    if (deactivateError) console.error('Error deactivating duplicates:', deactivateError);
                    else console.log(`✅ Deactivated ${duplicateIds.length} duplicate(s) for: ${template.slice(0, 30)}...`);
                }
            }
        }
    }

    console.log('\n🚀 Prompt setup complete!');
}

setup();

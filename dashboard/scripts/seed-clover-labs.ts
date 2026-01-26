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

async function seed() {
    console.log('🌱 Seeding Clover Labs data...');

    // 1. Clear existing test data (optional, but good for local testing)
    // We'll just insert and rely on unique IDs or just have multiple for now

    // 2. Insert Brand
    const { data: brand, error: brandError } = await supabase
        .from('brands')
        .insert({
            name: 'Clover Labs',
            domain: 'cloverlabs.ai',
            keywords: ['AI-Powered Go-To-Market (GTM) & Distribution', 'Autonomous Growth Agents', 'AI Revenue Infrastructure']
        })
        .select()
        .single();

    if (brandError) {
        console.error('Error inserting brand:', brandError);
        return;
    }

    console.log(`✅ Inserted brand: ${brand.name} (${brand.id})`);

    // 3. Insert Competitors
    const competitors = [
        { name: 'Clay', domain: 'clay.com' },
        { name: 'Apollo.io', domain: 'apollo.io' },
        { name: 'Redreach', domain: 'redreach.ai' }
    ];

    const { error: compError } = await supabase
        .from('competitors')
        .insert(competitors.map(c => ({ ...c, brand_id: brand.id })));

    if (compError) {
        console.error('Error inserting competitors:', compError);
    } else {
        console.log('✅ Inserted competitors');
    }

    // 4. Insert Prompts
    const prompts = [
        {
            category: 'discovery',
            intent: 'Identify top players in AI GTM',
            template: 'What are the top AI agents for automating GTM distribution and revenue growth in 2024?'
        },
        {
            category: 'comparison',
            intent: 'Compare brand with leader',
            template: 'How does {brand} compare to {competitor} for autonomous growth and distribution automation?'
        },
        {
            category: 'review',
            intent: 'Specific product feedback',
            template: 'Is RedRover from {brand} better than {competitor} for AI-powered Reddit marketing and lead generation?'
        }
    ];

    const { error: promptError } = await supabase
        .from('prompts')
        .insert(prompts.map(p => ({ ...p, is_active: true })));

    if (promptError) {
        console.error('Error inserting prompts:', promptError);
    } else {
        console.log('✅ Inserted prompt templates');
    }

    console.log('🚀 Seeding complete!');
    console.log('\nNext steps:');
    console.log(`1. Open Inngest Dev UI: http://localhost:8288`);
    console.log(`2. Send "collection.start" event with JSON:`);
    console.log(JSON.stringify({
        brandId: brand.id,
        models: ['gpt-4o', 'claude-3-5-sonnet']
    }, null, 2));
}

seed();

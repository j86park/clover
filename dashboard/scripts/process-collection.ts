import { createClient } from '@supabase/supabase-js';
import { runAnalysisPipeline } from '../src/lib/analysis/pipeline';
import { runMetricsPipeline } from '../src/lib/metrics/pipeline';
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

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

async function processLatest() {
    console.log('🔍 Finding latest completed collection...');

    // 1. Get latest collection
    const { data: collection, error: colError } = await supabase
        .from('collections')
        .select('*, brand:brands(*)')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (colError || !collection) {
        console.error('Error fetching collection:', colError);
        return;
    }

    console.log(`📦 Processing Collection: ${collection.id} for ${collection.brand.name}`);

    // 2. Run Analysis Pipeline
    console.log('🧪 Running Analysis Pipeline (this takes an LLM call per response)...');
    try {
        const analysisResult = await runAnalysisPipeline({
            collectionId: collection.id,
            trackedBrand: collection.brand.name,
            brandDomain: collection.brand.domain,
            concurrency: 5,
            supabase: supabase
        });
        console.log('✅ Analysis complete:', analysisResult);
    } catch (err) {
        console.error('❌ Analysis failed:', err);
        return;
    }

    // 3. Run Metrics Pipeline
    console.log('📊 Running Metrics Pipeline...');
    try {
        const metricsResult = await runMetricsPipeline(collection.id, supabase);
        console.log('✅ Metrics complete:', metricsResult);
    } catch (err) {
        console.error('❌ Metrics failed:', err);
        return;
    }

}

processLatest();

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually load env from .env.local
const envPath = path.resolve(__dirname, 'dashboard', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...parts] = line.split('=');
    if (key && parts.length > 0) env[key.trim()] = parts.join('=').trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    const brandId = '351ec92f-b604-4da3-b194-1fc1d6390626';

    // Check Brand and Competitors
    const { data: brand, error: brandError } = await supabase
        .from('brands')
        .select('*, competitors(*)')
        .eq('id', brandId)
        .single();

    if (brandError) console.error('Brand Error:', brandError);
    else console.log('Brand context:', JSON.stringify(brand, null, 2));

    // Check Prompts
    const promptIds = [
        "7ac63d5b-fa49-4cfd-862c-c80838581ea5",
        "15d5eb47-d000-413f-9633-210e5610200c",
        "f620e928-3f20-42a1-bdfc-31c0534c8d96"
    ];
    const { data: prompts, error: promptError } = await supabase
        .from('prompts')
        .select('*')
        .in('id', promptIds);

    if (promptError) console.error('Prompt Error:', promptError);
    else console.log('Selected Prompts:', JSON.stringify(prompts, null, 2));
}

checkData();

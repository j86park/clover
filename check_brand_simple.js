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

async function checkBrand() {
    const brandId = '351ec92f-b604-4da3-b194-1fc1d6390626';
    const { data, error } = await supabase.from('brands').select('*').eq('id', brandId).single();
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('BRAND_DATA_START');
        console.log(JSON.stringify(data, null, 2));
        console.log('BRAND_DATA_END');
    }
}

checkBrand();

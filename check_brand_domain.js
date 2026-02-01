import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, 'dashboard', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBrand() {
    const brandId = '351ec92f-b604-4da3-b194-1fc1d6390626';
    const { data, error } = await supabase.from('brands').select('*').eq('id', brandId).single();
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Brand Data:', JSON.stringify(data, null, 2));
    }
}

checkBrand();

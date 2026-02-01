import { createServiceClient } from './src/lib/supabase/service';

async function checkBrand() {
    const brandId = '351ec92f-b604-4da3-b194-1fc1d6390626';
    const supabase = createServiceClient();
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

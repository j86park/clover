import { createClient } from './dashboard/src/lib/supabase/service';

async function checkPrompts() {
    try {
        const supabase = createClient();
        const { data, error } = await supabase.from('prompts').select('*');
        if (error) {
            console.error('Error fetching prompts:', error);
            return;
        }
        console.log('Prompts in database:', data);
    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

checkPrompts();

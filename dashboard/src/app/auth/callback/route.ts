import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    // if "next" is in search params, use it as the redirection URL
    const next = searchParams.get('next') ?? '/';

    if (code) {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.exchangeCodeForSession(code);

        if (!authError && user) {
            // Check if user has a brand assigned
            const { data: existingBrand } = await supabase
                .from('brands')
                .select('id')
                .eq('user_id', user.id)
                .maybeSingle();

            if (!existingBrand) {
                // Create a default brand for the new user
                await supabase.from('brands').insert({
                    name: 'My Brand',
                    user_id: user.id,
                    keywords: [],
                });
            }

            const forwardedHost = request.headers.get('x-forwarded-host');
            const isLocalEnv = process.env.NODE_ENV === 'development';
            if (isLocalEnv) {
                // we can be sure that origin is http://localhost:3000
                return NextResponse.redirect(`${origin}${next}`);
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${next}`);
            } else {
                return NextResponse.redirect(`${origin}${next}`);
            }
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`);
}

import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
        console.error('Google OAuth Error:', error);
        return NextResponse.redirect(new URL('/settings?error=google_auth_failed', request.url));
    }

    if (!code) {
        return NextResponse.redirect(new URL('/settings', request.url));
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );

    try {
        const { tokens } = await oauth2Client.getToken(code);

        // Save tokens to database
        const { data: existing } = await supabase
            .from('user_settings')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();

        const tokenData = {
            google_access_token: tokens.access_token,
            google_refresh_token: tokens.refresh_token, // might be undefined if not first time or prompt=consent missing
            google_token_expiry: tokens.expiry_date,
        };

        // Only update refresh token if one was provided in this exchange
        if (!tokens.refresh_token) {
            delete (tokenData as any).google_refresh_token;
        }

        if (existing) {
            await supabase
                .from('user_settings')
                .update(tokenData)
                .eq('id', existing.id);
        } else {
            await supabase
                .from('user_settings')
                .insert({ user_id: user.id, ...tokenData });
        }

        // Redirect back to settings on success
        return NextResponse.redirect(new URL('/settings?success=google_connected', request.url));
    } catch (err) {
        console.error('Error exchanging google code for token', err);
        return NextResponse.redirect(new URL('/settings?error=google_token_exchange_failed', request.url));
    }
}

import ICAL from 'ical.js';
import { createClient } from './supabase/server';
import { google } from 'googleapis';

export interface CalendarEvent {
    title: string;
    start: Date;
    end: Date;
    location?: string;
    allDay?: boolean;
}

export interface CalendarResult {
    events: CalendarEvent[];
    hasUrl: boolean;
    error?: string;
}

export async function getCalendarEvents(date: Date): Promise<CalendarResult> {
    const supabase = await createClient();

    // 1. Get User
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { events: [], hasUrl: false };

    // 2. Get Settings (URL and Google Tokens)
    const { data: settings } = await supabase
        .from('user_settings')
        .select('calendar_url, google_refresh_token, google_access_token, google_token_expiry')
        .eq('user_id', user.id)
        .maybeSingle();

    if (!settings) return { events: [], hasUrl: false };

    // 3. Try Google API first if connected
    if (settings.google_refresh_token) {
        try {
            const oauth2Client = new google.auth.OAuth2(
                process.env.GOOGLE_CLIENT_ID,
                process.env.GOOGLE_CLIENT_SECRET,
                process.env.GOOGLE_REDIRECT_URI
            );

            oauth2Client.setCredentials({
                refresh_token: settings.google_refresh_token,
                access_token: settings.google_access_token,
                expiry_date: settings.google_token_expiry,
            });

            // Handle token refresh automatically
            oauth2Client.on('tokens', async (tokens) => {
                if (tokens.refresh_token) {
                    await supabase
                        .from('user_settings')
                        .update({
                            google_access_token: tokens.access_token,
                            google_refresh_token: tokens.refresh_token,
                            google_token_expiry: tokens.expiry_date,
                        })
                        .eq('user_id', user.id);
                } else {
                    await supabase
                        .from('user_settings')
                        .update({
                            google_access_token: tokens.access_token,
                            google_token_expiry: tokens.expiry_date,
                        })
                        .eq('user_id', user.id);
                }
            });

            const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

            const dayStart = new Date(date);
            dayStart.setHours(0, 0, 0, 0);

            const dayEnd = new Date(date);
            dayEnd.setHours(23, 59, 59, 999);

            const res = await calendar.events.list({
                calendarId: 'primary',
                timeMin: dayStart.toISOString(),
                timeMax: dayEnd.toISOString(),
                singleEvents: true,
                orderBy: 'startTime',
            });

            const googleEvents = res.data.items || [];

            const formattedEvents: CalendarEvent[] = googleEvents.map(item => {
                const start = item.start?.dateTime || item.start?.date;
                const end = item.end?.dateTime || item.end?.date;
                const isAllDay = !!item.start?.date;

                return {
                    title: item.summary || 'Opptatt',
                    start: new Date(start as string),
                    end: new Date(end as string),
                    location: item.location || undefined,
                    allDay: isAllDay
                };
            });

            return { events: formattedEvents, hasUrl: true };

        } catch (error) {
            console.error("Error fetching from Google Calendar API:", error);
            // Fallback to ICS if it exists, otherwise return error
            if (!settings.calendar_url) {
                return { events: [], hasUrl: true, error: "Google Kalender feilet. Prøv å koble til på nytt." };
            }
        }
    }

    // 4. Fallback to ICS URL
    if (!settings.calendar_url) return { events: [], hasUrl: false };

    try {
        const response = await fetch(settings.calendar_url);
        if (!response.ok) throw new Error("Could not fetch calendar");
        const icsData = await response.text();

        const jcalData = ICAL.parse(icsData);
        const comp = new ICAL.Component(jcalData);
        const vevents = comp.getAllSubcomponents('vevent');

        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);

        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);

        const dailyEvents: CalendarEvent[] = [];

        vevents.forEach(event => {
            const eventComp = new ICAL.Event(event);
            let start = eventComp.startDate.toJSDate();
            let end = eventComp.endDate.toJSDate();
            const isAllDay = eventComp.startDate.isDate;

            if (start <= dayEnd && end >= dayStart) {
                dailyEvents.push({
                    title: eventComp.summary,
                    start: start,
                    end: end,
                    location: eventComp.location,
                    allDay: isAllDay
                });
            }
        });

        const sorted = dailyEvents.sort((a, b) => a.start.getTime() - b.start.getTime());
        return { events: sorted, hasUrl: true };

    } catch (error) {
        console.error("Error fetching/parsing calendar:", error);
        return { events: [], hasUrl: true, error: "Kunne ikke hente kalender fra URL." };
    }
}

export async function saveCalendarUrl(url: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Check if settings exist
    const { data: existing } = await supabase
        .from('user_settings')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

    if (existing) {
        await supabase
            .from('user_settings')
            .update({ calendar_url: url })
            .eq('id', existing.id);
    } else {
        await supabase
            .from('user_settings')
            .insert({ user_id: user.id, calendar_url: url });
    }
}

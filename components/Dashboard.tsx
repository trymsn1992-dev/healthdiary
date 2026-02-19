"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ScoreRing } from "./ScoreRing";
import type { OuraDailySleep, OuraDailyActivity, OuraDailyReadiness } from "@/lib/oura";
import { User } from "@supabase/supabase-js";
import { Bell, Activity, Sun, Moon, CalendarDays } from "lucide-react";

import { DayLog, Mood, Symptom } from "@/lib/types";
import { CalendarEvent } from "@/lib/calendar";

interface DashboardProps {
    initialOuraData: {
        sleep: OuraDailySleep | null;
        activity: OuraDailyActivity | null;
        readiness: OuraDailyReadiness | null;
    };
    user: User;
    initialMoodLog: { mood_score: number, note: string | null } | null;
    initialSymptomLog: { symptoms: any[] } | null;
    calendarData: { events: CalendarEvent[], hasUrl: boolean, error?: string };
}

export function Dashboard({ initialOuraData, user, initialMoodLog, initialSymptomLog, calendarData }: DashboardProps) {
    const today = format(new Date(), "EEEE, MMMM do");

    // Helper to map score to mood string
    const scoreToMood = (score: number) => {
        const moods = ["unbearable", "very_bad", "bad", "poor", "mixed", "okay", "good", "very_good", "great", "amazing"];
        return moods[score - 1] || null;
    };

    const moodLabel = initialMoodLog ? scoreToMood(initialMoodLog.mood_score) : null;
    // Map of labels for display
    const moodLabels: Record<string, string> = {
        "unbearable": "Unbearable", "very_bad": "Very Bad", "bad": "Bad", "poor": "Poor",
        "mixed": "Mixed", "okay": "Okay", "good": "Good", "very_good": "Very Good",
        "great": "Great", "amazing": "Amazing"
    };
    const displayLabel = moodLabel ? moodLabels[moodLabel] : null;

    return (
        <div className="p-6 space-y-8">
            <header className="flex justify-between items-center pt-2">
                <div>
                    <h2 className="text-xs font-bold tracking-widest text-indigo-400 uppercase mb-1">Health Diary</h2>
                    <h1 className="text-2xl font-bold text-neutral-100">Oversikt</h1>
                </div>
                <Link href="/settings" className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center border border-neutral-700 hover:border-neutral-500 transition-colors">
                    <span className="font-bold text-neutral-400">{user.email?.charAt(0).toUpperCase()}</span>
                </Link>
            </header>

            {/* Oura Data Section - Card Style */}
            <section className="bg-neutral-900 rounded-3xl p-6 border border-neutral-800 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-neutral-200 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-indigo-400" />
                        Dagens Status
                    </h2>
                    <span className="text-xs bg-neutral-800 px-3 py-1 rounded-full text-neutral-400 font-medium">
                        {today}
                    </span>
                </div>

                <div className="flex justify-between items-center px-2">
                    <ScoreRing
                        score={initialOuraData.sleep?.score ?? 0}
                        label="Søvn"
                        color={initialOuraData.sleep ? "text-indigo-400" : "text-neutral-700"}
                    />
                    <ScoreRing
                        score={initialOuraData.readiness?.score ?? 0}
                        label="Klarhet"
                        color={initialOuraData.readiness ? "text-emerald-400" : "text-neutral-700"}
                    />
                    <ScoreRing
                        score={initialOuraData.activity?.score ?? 0}
                        label="Aktivitet"
                        color={initialOuraData.activity ? "text-rose-400" : "text-neutral-700"}
                    />
                </div>

                {!initialOuraData.sleep?.day && (
                    <div className="mt-6 p-4 bg-neutral-950/50 rounded-xl text-center">
                        <p className="text-sm text-neutral-500">Ingen Oura data funnet for i dag.</p>
                    </div>
                )}
            </section>


            {/* Calendar Events Section */}
            {calendarData.hasUrl && (
                <section className="bg-neutral-900 rounded-3xl p-6 border border-neutral-800 shadow-xl">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-neutral-200 flex items-center gap-2">
                            <CalendarDays className="w-5 h-5 text-indigo-400" />
                            Dagens Planer
                        </h2>
                    </div>

                    {calendarData.error ? (
                        <div className="p-4 bg-red-900/20 text-red-300 rounded-xl text-sm border border-red-900/50">
                            Failed to load calendar. Check URL in settings.
                        </div>
                    ) : calendarData.events.length > 0 ? (
                        <div className="space-y-3">
                            {calendarData.events.map((event, i) => (
                                <div key={i} className="flex gap-4 p-3 bg-neutral-950/50 rounded-xl border border-neutral-800/50">
                                    <div className="flex flex-col items-center justify-center min-w-[3rem] px-2 border-r border-neutral-800">
                                        {event.allDay ? (
                                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">HELE DAGEN</span>
                                        ) : (
                                            <span className="text-xs font-bold text-neutral-500">
                                                {format(new Date(event.start), "HH:mm")}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-neutral-200">{event.title}</h3>
                                        {event.location && <p className="text-xs text-neutral-500">{event.location}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-4 bg-neutral-950/50 rounded-xl text-center">
                            <p className="text-sm text-neutral-500 italic">Ingen planer i kalenderen i dag.</p>
                        </div>
                    )}
                </section>
            )}

            {/* Today's Log Status - Read Only */}
            {initialMoodLog ? (
                <section className="bg-neutral-900 rounded-3xl p-6 border border-neutral-800 shadow-xl space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Sun className="w-5 h-5 text-yellow-500" />
                        <h3 className="font-bold text-neutral-200">Dine Observasjoner</h3>
                    </div>

                    <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-900 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-neutral-400">Humør</p>
                            <p className="text-lg font-bold text-neutral-200">{displayLabel}</p>
                        </div>
                        {initialSymptomLog && (initialSymptomLog.symptoms as any[]).length > 0 && (
                            <div className="text-right">
                                <p className="text-sm text-neutral-400">Symptomer</p>
                                <p className="text-lg font-bold text-neutral-200">{(initialSymptomLog.symptoms as any[]).length} registrert</p>
                            </div>
                        )}
                    </div>

                    {initialMoodLog.note && (
                        <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-900">
                            <p className="text-sm text-neutral-400 italic">"{initialMoodLog.note}"</p>
                        </div>
                    )}
                </section>
            ) : (
                <section className="bg-neutral-900 rounded-3xl p-6 border border-neutral-800 shadow-xl space-y-4 opacity-50">
                    <div className="flex items-center gap-2 mb-2">
                        <Moon className="w-5 h-5 text-neutral-500" />
                        <h3 className="font-bold text-neutral-200">Ingen loggføring enda</h3>
                    </div>
                    <p className="text-sm text-neutral-500">Bruk + knappen for å logge dagen.</p>
                </section>
            )}
        </div>
    );
}

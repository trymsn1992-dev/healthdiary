import { createClient } from "@/lib/supabase/server";
import { format, parseISO } from "date-fns";
import { MoveLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Mood, Symptom } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
    Angry,
    Frown,
    Meh,
    Smile,
    Laugh,
    HeartCrack,
    CloudRain,
    CloudLightning,
    Sun,
    Zap
} from "lucide-react";

// Reuse the mood map (should ideally be in a shared constant file, but duplicating for speed now)
const moodConfig: Record<string, { icon: any, label: string, color: string }> = {
    "unbearable": { icon: CloudLightning, label: "Unbearable", color: "text-neutral-500" },
    "very_bad": { icon: HeartCrack, label: "Very Bad", color: "text-red-700" },
    "bad": { icon: Angry, label: "Bad", color: "text-red-500" },
    "poor": { icon: CloudRain, label: "Poor", color: "text-orange-500" },
    "mixed": { icon: Frown, label: "Mixed", color: "text-yellow-600" },
    "okay": { icon: Meh, label: "Okay", color: "text-yellow-400" },
    "good": { icon: Smile, label: "Good", color: "text-lime-400" },
    "very_good": { icon: Sun, label: "Very Good", color: "text-green-400" },
    "great": { icon: Laugh, label: "Great", color: "text-green-500" },
    "amazing": { icon: Zap, label: "Amazing", color: "text-cyan-400" },
};

// Helper to map database score to Mood string
const scoreToMood = (score: number): Mood | null => {
    switch (score) {
        case 1: return "unbearable";
        case 2: return "very_bad";
        case 3: return "bad";
        case 4: return "poor";
        case 5: return "mixed";
        case 6: return "okay";
        case 7: return "good";
        case 8: return "very_good";
        case 9: return "great";
        case 10: return "amazing";
        default: return null;
    }
};

export default async function HistoryPage() {
    const supabase = await createClient(); // Await the client creation for server component

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        redirect("/login");
    }

    // Fetch Mood Logs
    const { data: moodLogs } = await supabase
        .from("mood_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

    // Fetch Symptom Logs
    const { data: symptomLogs } = await supabase
        .from("symptom_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

    // Combine data by date
    const historyMap = new Map<string, { mood: Mood | null; symptoms: Symptom[] }>();

    // Process moods
    moodLogs?.forEach(log => {
        if (!historyMap.has(log.date)) {
            historyMap.set(log.date, { mood: null, symptoms: [] });
        }
        historyMap.get(log.date)!.mood = scoreToMood(log.mood_score);
    });

    // Process symptoms
    symptomLogs?.forEach(log => {
        if (!historyMap.has(log.date)) {
            historyMap.set(log.date, { mood: null, symptoms: [] });
        }
        const current = historyMap.get(log.date)!;
        // Use type assertion or validation here as needed. Ensure JSONB is parsed if not auto-parsed.
        // Supabase client usually returns JSON columns as objects.
        if (Array.isArray(log.symptoms)) {
            current.symptoms = log.symptoms as unknown as Symptom[];
        }
    });

    // Convert to sorted array
    const historyList = Array.from(historyMap.entries())
        .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
        .map(([date, data]) => ({ date, ...data }));

    return (
        <div className="max-w-md mx-auto p-4 space-y-8 pb-20 min-h-screen bg-neutral-950 text-neutral-200">
            <header className="flex items-center gap-4 py-6">
                <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-neutral-900 transition-colors">
                    <MoveLeft className="w-6 h-6 text-neutral-400" />
                </Link>
                <h1 className="text-2xl font-bold text-neutral-100">History</h1>
            </header>

            <div className="space-y-4">
                {historyList.length === 0 ? (
                    <div className="text-center py-10 text-neutral-500">
                        <p>No logs found yet.</p>
                        <p className="text-sm mt-2">Start logging your days to see history here.</p>
                    </div>
                ) : (
                    historyList.map((day) => {
                        const moodInfo = day.mood ? moodConfig[day.mood] : null;
                        const dateDate = parseISO(day.date);

                        return (
                            <div key={day.date} className="bg-neutral-900/50 p-4 rounded-xl border border-neutral-800 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    {/* Mood Icon */}
                                    <div className={cn("w-12 h-12 rounded-full flex items-center justify-center bg-neutral-800 shrink-0", moodInfo ? "" : "opacity-30")}>
                                        {moodInfo ? (
                                            <moodInfo.icon className={cn("w-6 h-6", moodInfo.color)} />
                                        ) : (
                                            <Meh className="w-6 h-6 text-neutral-600" />
                                        )}
                                    </div>

                                    <div className="flex flex-col">
                                        <span className="font-semibold text-neutral-200">
                                            {format(dateDate, "EEEE, MMMM do")}
                                        </span>
                                        <div className="flex items-center gap-2 text-sm text-neutral-500">
                                            <span>{moodInfo?.label || "No mood logged"}</span>
                                            {day.symptoms.length > 0 && (
                                                <>
                                                    <span>•</span>
                                                    <span>{day.symptoms.length} Symptoms</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right side detail indicator or symptom pills */}
                                {day.symptoms.length > 0 && (
                                    <div className="flex -space-x-2 overflow-hidden">
                                        {day.symptoms.slice(0, 3).map((s, i) => (
                                            <div key={i} className="w-2 h-2 rounded-full bg-red-500 ring-2 ring-neutral-900" />
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

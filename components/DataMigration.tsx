
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Upload, Check, AlertTriangle, Loader2 } from "lucide-react";
import { type DayLog, type Mood } from "@/lib/types";

// Helper to map Mood to database score
const moodToScore = (mood: Mood): number => {
    switch (mood) {
        case "terrible": return 1;
        case "bad": return 2;
        case "neutral": return 3;
        case "good": return 4;
        case "amazing": return 5;
    }
};

export function DataMigration() {
    const [status, setStatus] = useState<"idle" | "scanning" | "migrating" | "success" | "error" | "empty">("idle");
    const [count, setCount] = useState(0);
    const [progress, setProgress] = useState(0);

    const supabase = createClient();

    const scanData = () => {
        setStatus("scanning");
        let found = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith("health-diary-")) {
                found++;
            }
        }
        setCount(found);
        if (found === 0) {
            setStatus("empty");
        } else {
            setStatus("idle"); // Ready to migrate
        }
    };

    const migrateData = async () => {
        setStatus("migrating");
        setProgress(0);
        let processed = 0;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user logged in");

            const keys = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key?.startsWith("health-diary-")) {
                    keys.push(key);
                }
            }

            for (const key of keys) {
                try {
                    const raw = localStorage.getItem(key);
                    if (!raw) continue;

                    const log: DayLog = JSON.parse(raw);
                    // key format: health-diary-YYYY-MM-DD
                    const date = key.replace("health-diary-", "");

                    // 1. Insert/Update Mood
                    if (log.mood) {
                        const score = moodToScore(log.mood);
                        // Check existing to avoid duplicates or assume upsert logic if we had constraints
                        // For simplicity in migration, we'll try to insert, if it fails/duplicates we might want to handle it
                        // but since we are moving from local, local is probably the 'truth' for old dates.

                        // Let's delete existing for this date first to be safe? Or just upsert?
                        // We implemented RLS, so we can only touch our own rows.

                        // Cleanest: Check if exists, if not insert.
                        const { data: existingMood } = await supabase
                            .from("mood_logs")
                            .select("id")
                            .eq("date", date)
                            .eq("user_id", user.id)
                            .maybeSingle();

                        if (!existingMood) {
                            await supabase.from("mood_logs").insert({
                                user_id: user.id,
                                date: date,
                                mood_score: score,
                                note: log.notes
                            });
                        }
                    }

                    // 2. Insert/Update Symptoms
                    if (log.symptoms && log.symptoms.length > 0) {
                        const { data: existingSymptoms } = await supabase
                            .from("symptom_logs")
                            .select("id")
                            .eq("date", date)
                            .eq("user_id", user.id)
                            .maybeSingle();

                        if (!existingSymptoms) {
                            await supabase.from("symptom_logs").insert({
                                user_id: user.id,
                                date: date,
                                symptoms: log.symptoms as any
                            });
                        }
                    }

                } catch (e) {
                    console.error("Failed to migrate entry", key, e);
                }

                processed++;
                setProgress(Math.round((processed / keys.length) * 100));
            }

            setStatus("success");
            // Optional: Clear local storage after success?
            // localStorage.clear(); // Maybe too aggressive.
        } catch (error) {
            console.error("Migration failed", error);
            setStatus("error");
        }
    };

    // Auto-scan on mount? No, let user initiate.

    if (status === "success") {
        return (
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3">
                <Check className="text-green-500 h-5 w-5" />
                <div className="text-sm">
                    <p className="text-green-200 font-medium">Migration Complete</p>
                    <p className="text-green-500/80">Your local history has been uploaded.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl space-y-3">
            <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Upload className="text-blue-400 h-5 w-5" />
                </div>
                <div>
                    <h3 className="text-neutral-200 font-medium text-sm">Migrate Local Data</h3>
                    <p className="text-neutral-500 text-xs mt-1">
                        You have data stored on this device. Upload it to the cloud to access it everywhere.
                    </p>
                </div>
            </div>

            {status === "idle" && count === 0 && (
                <button
                    onClick={scanData}
                    className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium rounded-lg transition-colors"
                >
                    Check for local data
                </button>
            )}

            {status === "idle" && count > 0 && (
                <button
                    onClick={migrateData}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    Migrate {count} entries
                </button>
            )}

            {status === "scanning" && (
                <div className="text-center text-neutral-500 text-xs py-2">Scanning...</div>
            )}

            {status === "migrating" && (
                <div className="space-y-2">
                    <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                        <div
                            className="bg-blue-500 h-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="text-center text-neutral-500 text-xs">Migrating... {progress}%</p>
                </div>
            )}

            {status === "empty" && (
                <p className="text-center text-neutral-500 text-xs py-2 italic">No local data found.</p>
            )}

            {status === "error" && (
                <p className="text-center text-red-400 text-xs py-2">Migration failed. Please try again.</p>
            )}
        </div>
    );
}

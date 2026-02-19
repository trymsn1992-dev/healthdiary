"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { MoodLoggerV2 } from "./MoodLoggerV2";
import { SymptomLogger } from "./SymptomLogger";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { DayLog, Mood, Symptom } from "@/lib/types";

import { useRouter } from "next/navigation";

interface LogModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
}

// Helper to map Mood to database score (1-10)
const moodToScore = (mood: Mood): number => {
    switch (mood) {
        case "unbearable": return 1;
        case "very_bad": return 2;
        case "bad": return 3;
        case "poor": return 4;
        case "mixed": return 5;
        case "okay": return 6;
        case "good": return 7;
        case "very_good": return 8;
        case "great": return 9;
        case "amazing": return 10;
        default: return 6;
    }
};

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

export function LogModal({ isOpen, onClose, userId }: LogModalProps) {
    const supabase = createClient();
    const router = useRouter();
    const today = format(new Date(), "yyyy-MM-dd");

    const [log, setLog] = useState<DayLog>({
        date: today,
        mood: null,
        symptoms: [],
    });

    // Fetch existing data when modal opens
    useEffect(() => {
        if (isOpen) {
            const fetchData = async () => {
                const { data: moodData } = await supabase.from("mood_logs").select("*").eq("date", today).eq("user_id", userId).maybeSingle();
                const { data: symptomData } = await supabase.from("symptom_logs").select("*").eq("date", today).eq("user_id", userId).maybeSingle();

                setLog({
                    date: today,
                    mood: moodData ? scoreToMood(moodData.mood_score) : null,
                    symptoms: symptomData?.symptoms ? (symptomData.symptoms as unknown as Symptom[]) : [],
                    notes: moodData?.note || undefined
                });
            };
            fetchData();
        }
    }, [isOpen, userId, today]);


    const handleMoodSelect = async (mood: Mood) => {
        setLog(prev => ({ ...prev, mood }));
        const score = moodToScore(mood);
        const { data: existing } = await supabase.from("mood_logs").select("id").eq("date", today).eq("user_id", userId).maybeSingle();

        if (existing) {
            await supabase.from("mood_logs").update({ mood_score: score }).eq("id", existing.id);
        } else {
            await supabase.from("mood_logs").insert({ user_id: userId, date: today, mood_score: score });
        }
    };

    const handleAddSymptom = async (symptom: Symptom) => {
        const newSymptoms = [...log.symptoms, symptom];
        setLog(prev => ({ ...prev, symptoms: newSymptoms }));
        await saveSymptoms(newSymptoms);
    };

    const handleRemoveSymptom = async (id: string) => {
        const newSymptoms = log.symptoms.filter(s => s.id !== id);
        setLog(prev => ({ ...prev, symptoms: newSymptoms }));
        await saveSymptoms(newSymptoms);
    };

    const saveSymptoms = async (currentSymptoms: Symptom[]) => {
        const { data: existing } = await supabase.from("symptom_logs").select("id").eq("date", today).eq("user_id", userId).maybeSingle();
        if (existing) {
            await supabase.from("symptom_logs").update({ symptoms: currentSymptoms }).eq("id", existing.id);
        } else {
            await supabase.from("symptom_logs").insert({ user_id: userId, date: today, symptoms: currentSymptoms });
        }
    };

    const handleClose = () => {
        router.refresh(); // Fetch new data from server
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    />

                    {/* Modal Content - Slide up from bottom */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed bottom-0 left-0 right-0 z-50 bg-neutral-900 rounded-t-[2rem] border-t border-neutral-800 max-h-[90vh] overflow-y-auto shadow-2xl"
                    >
                        {/* Drag Handle */}
                        <div className="w-full h-6 flex items-center justify-center pt-2" onClick={handleClose}>
                            <div className="w-12 h-1.5 rounded-full bg-neutral-700" />
                        </div>

                        <div className="p-6 space-y-8 pb-24">
                            <header className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-bold text-neutral-100">Daily Log</h2>
                                    <p className="text-neutral-500">{format(new Date(), "EEEE, MMMM do")}</p>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 transition-colors"
                                >
                                    <X className="w-6 h-6 text-neutral-400" />
                                </button>
                            </header>

                            <MoodLoggerV2 selectedMood={log.mood} onMoodSelect={handleMoodSelect} />

                            <SymptomLogger
                                symptoms={log.symptoms}
                                onAddSymptom={handleAddSymptom}
                                onRemoveSymptom={handleRemoveSymptom}
                            />

                            <div className="pt-4">
                                <button
                                    onClick={handleClose}
                                    className="w-full py-4 rounded-2xl font-bold text-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-900/20"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

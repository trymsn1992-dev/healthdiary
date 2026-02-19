"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { type Mood } from "@/lib/types";
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

interface MoodLoggerProps {
    onMoodSelect: (mood: Mood) => void;
    selectedMood: Mood | null;
}

const moodOptions: { value: Mood; icon: React.ElementType; color: string; label: string }[] = [
    { value: "unbearable", icon: CloudLightning, color: "text-neutral-500", label: "Unbearable" }, // 1
    { value: "very_bad", icon: HeartCrack, color: "text-red-700", label: "Very Bad" }, // 2
    { value: "bad", icon: Angry, color: "text-red-500", label: "Bad" }, // 3
    { value: "poor", icon: CloudRain, color: "text-orange-500", label: "Poor" }, // 4
    { value: "mixed", icon: Frown, color: "text-yellow-600", label: "Mixed" }, // 5
    { value: "okay", icon: Meh, color: "text-yellow-400", label: "Okay" }, // 6
    { value: "good", icon: Smile, color: "text-lime-400", label: "Good" }, // 7
    { value: "very_good", icon: Sun, color: "text-green-400", label: "Very Good" }, // 8
    { value: "great", icon: Laugh, color: "text-green-500", label: "Great" }, // 9
    { value: "amazing", icon: Zap, color: "text-cyan-400", label: "Amazing" }, // 10
];

export function MoodLogger({ onMoodSelect, selectedMood }: MoodLoggerProps) {
    return (
        <div className="w-full p-4 rounded-xl bg-neutral-900 border border-neutral-800">
            <h2 className="text-lg font-semibold mb-4 text-neutral-200">How do you feel today?</h2>

            {/* Grid for 10 items: 5 per row for mobile/desktop balance */}
            <div className="grid grid-cols-5 gap-y-6 gap-x-2">
                {moodOptions.map((option) => {
                    const isSelected = selectedMood === option.value;
                    return (
                        <motion.button
                            key={option.value}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onMoodSelect(option.value)}
                            className={cn(
                                "flex flex-col items-center gap-2 p-2 rounded-xl transition-all duration-300",
                                isSelected ? "bg-neutral-800 ring-2 ring-primary ring-offset-2 ring-offset-neutral-950" : "hover:bg-neutral-800/50"
                            )}
                        >
                            <option.icon
                                className={cn(
                                    "w-8 h-8 transition-colors",
                                    isSelected ? option.color : "text-neutral-600 group-hover:text-neutral-400"
                                )}
                            />
                            <span className={cn("text-[0.65rem] font-medium text-center leading-tight", isSelected ? "text-neutral-200" : "text-neutral-500")}>
                                {option.label}
                            </span>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}

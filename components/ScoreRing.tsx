"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ScoreRingProps {
    score: number;
    label: string;
    color?: string;
    size?: number;
}

export function ScoreRing({ score, label, color = "text-primary", size = 120 }: ScoreRingProps) {
    const radius = 42;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
        <div className="flex flex-col items-center justify-center gap-3">
            <div className="relative flex items-center justify-center group" style={{ width: size, height: size }}>
                {/* Subtle background glow when hovered */}
                <div className={cn("absolute inset-0 rounded-full blur-xl opacity-0 group-hover:opacity-20 transition-opacity bg-current", color)} />

                {/* SVG Ring Container */}
                <svg className="w-full h-full transform -rotate-90 drop-shadow-lg">
                    {/* Background Ring */}
                    <circle
                        cx="50%"
                        cy="50%"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="10"
                        fill="transparent"
                        className="text-neutral-800/60"
                        strokeLinecap="round"
                    />
                    {/* Progress Ring */}
                    <motion.circle
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        cx="50%"
                        cy="50%"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="10"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeLinecap="round"
                        className={cn("drop-shadow-sm", color)}
                    />
                </svg>

                {/* Score Number inside */}
                <div className="absolute flex flex-col items-center justify-center inset-0">
                    <span className="text-3xl font-bold tracking-tight text-white drop-shadow-md">{score}</span>
                </div>
            </div>
            <span className="text-sm font-medium text-neutral-400 tracking-wide">{label}</span>
        </div>
    );
}

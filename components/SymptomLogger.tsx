"use client";

import { useState } from "react";
import { Plus, X, Thermometer, Brain, Activity, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

import { motion, AnimatePresence } from "framer-motion";
import { type Symptom } from "@/lib/types";

// Simple Button component since I haven't created ui/button yet
function SimpleButton({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            className={cn(
                "px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-neutral-950 disabled:opacity-50 disabled:cursor-not-allowed",
                className
            )}
            {...props}
        />
    );
}


interface SymptomLoggerProps {
    symptoms: Symptom[];
    onAddSymptom: (symptom: Symptom) => void;
    onRemoveSymptom: (id: string) => void;
}

const COMMON_SYMPTOMS = [
    { name: "Headache", icon: Brain },
    { name: "Fever", icon: Thermometer },
    { name: "Muscle Pain", icon: Activity },
    { name: "Fatigue", icon: Zap },
];

export function SymptomLogger({ symptoms, onAddSymptom, onRemoveSymptom }: SymptomLoggerProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [newSymptomName, setNewSymptomName] = useState("");
    const [severity, setSeverity] = useState(5);

    const handleAdd = () => {
        if (!newSymptomName.trim()) return;
        onAddSymptom({
            id: crypto.randomUUID(),
            name: newSymptomName,
            severity,
        });
        setNewSymptomName("");
        setSeverity(5);
        setIsAdding(false);
    };

    return (
        <div className="w-full p-4 rounded-xl bg-neutral-900 border border-neutral-800">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-neutral-200">Physical Symptoms</h2>
                <SimpleButton
                    onClick={() => setIsAdding(!isAdding)}
                    className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm py-1 px-3"
                >
                    {isAdding ? "Cancel" : "Add Symptom"}
                </SimpleButton>
            </div>

            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mb-4 overflow-hidden"
                    >
                        <div className="flex flex-col gap-3 p-3 bg-neutral-950/50 rounded-lg">
                            <div className="flex gap-2">
                                {COMMON_SYMPTOMS.map((s) => (
                                    <button
                                        key={s.name}
                                        onClick={() => setNewSymptomName(s.name)}
                                        className={cn(
                                            "flex items-center gap-1 px-2 py-1 rounded text-xs border border-neutral-700",
                                            newSymptomName === s.name ? "bg-primary/20 border-primary text-primary" : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
                                        )}
                                    >
                                        <s.icon className="w-3 h-3" />
                                        {s.name}
                                    </button>
                                ))}
                            </div>
                            <input
                                type="text"
                                placeholder="Symptom name (e.g., Knee Pain)"
                                value={newSymptomName}
                                onChange={(e) => setNewSymptomName(e.target.value)}
                                className="w-full bg-neutral-800 border-neutral-700 rounded-md px-3 py-2 text-neutral-200 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                            />
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-neutral-400">Severity: {severity}</span>
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={severity}
                                    onChange={(e) => setSeverity(parseInt(e.target.value))}
                                    className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                            </div>
                            <SimpleButton
                                onClick={handleAdd}
                                className="bg-neutral-100 text-neutral-950 hover:bg-neutral-200 w-full"
                            >
                                Save Symptom
                            </SimpleButton>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="space-y-2">
                {symptoms.length === 0 && !isAdding && (
                    <p className="text-neutral-500 text-sm italic">No symptoms logged yet.</p>
                )}
                <AnimatePresence>
                    {symptoms.map((symptom) => (
                        <motion.div
                            key={symptom.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="flex items-center justify-between p-3 bg-neutral-800/30 rounded-lg border border-neutral-800"
                        >
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "w-2 h-2 rounded-full",
                                    symptom.severity <= 3 ? "bg-green-500" : symptom.severity <= 6 ? "bg-yellow-500" : "bg-red-500"
                                )} />
                                <span className="text-neutral-200 font-medium">{symptom.name}</span>
                                <span className="text-neutral-500 text-xs bg-neutral-800 px-1.5 py-0.5 rounded">
                                    Severity: {symptom.severity}
                                </span>
                            </div>
                            <button
                                onClick={() => onRemoveSymptom(symptom.id)}
                                className="text-neutral-500 hover:text-red-400 transition-colors p-1"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}

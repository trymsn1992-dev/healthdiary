export type Mood =
    | "unbearable"
    | "very_bad"
    | "bad"
    | "poor"
    | "mixed"
    | "okay"
    | "good"
    | "very_good"
    | "great"
    | "amazing";


export interface Symptom {
    id: string;
    name: string;
    severity: number; // 1-10
    location?: string; // e.g., "head", "knees"
}

export interface DayLog {
    date: string;
    mood: Mood | null;
    symptoms: Symptom[];
    notes?: string;
}

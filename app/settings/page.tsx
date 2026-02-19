"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MoveLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
    const [url, setUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");
    const supabase = createClient();
    const router = useRouter();

    const handleSave = async () => {
        setIsLoading(true);
        setMessage("");

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not logged in");

            // Check if exists
            const { data: existing } = await supabase
                .from("user_settings")
                .select("id")
                .eq("user_id", user.id)
                .maybeSingle();

            if (existing) {
                await supabase
                    .from("user_settings")
                    .update({ calendar_url: url })
                    .eq("id", existing.id);
            } else {
                await supabase
                    .from("user_settings")
                    .insert({ user_id: user.id, calendar_url: url });
            }

            setMessage("Lagret!");
            setTimeout(() => router.push("/"), 1000);
        } catch (error) {
            console.error(error);
            setMessage("Noe gikk galt.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 space-y-8 min-h-screen bg-neutral-950 text-neutral-200">
            <header className="flex items-center gap-4 py-2">
                <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-neutral-900 transition-colors">
                    <MoveLeft className="w-6 h-6 text-neutral-400" />
                </Link>
                <h1 className="text-2xl font-bold text-neutral-100">Innstillinger</h1>
            </header>

            <section className="space-y-4">
                <h2 className="text-lg font-semibold text-neutral-100">Kalender Integrasjon</h2>
                <p className="text-sm text-neutral-400">
                    Lim inn din "Secret address in iCal format" fra Google Calendar eller iCloud for å se avtalene dine her.
                </p>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-500 uppercase">iCal URL</label>
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://calendar.google.com/..."
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-neutral-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <div className="pt-4 pb-8 border-b border-neutral-800">
                    <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="w-full py-4 rounded-xl font-bold bg-neutral-100 text-neutral-950 hover:bg-white transition-colors flex items-center justify-center gap-2"
                    >
                        {isLoading ? "Lagrer..." : (
                            <>
                                <Save className="w-5 h-5" />
                                Lagre iCal
                            </>
                        )}
                    </button>
                    {message && <p className="text-center text-sm mt-4 text-green-400">{message}</p>}
                </div>
            </section>

            <section className="space-y-4 pt-4">
                <h2 className="text-lg font-semibold text-neutral-100">Ekte Google Kalender</h2>
                <p className="text-sm text-neutral-400">
                    Anbefalt for jobb-kalendere (f.eks. @grin.no) som ikke tillater deling via lenke.
                </p>
                <div className="pt-2 text-center text-sm text-neutral-500">
                    Siden vi akkurat har satt opp dette, må du kanskje logge inn på nytt etter å ha trykket på knappen.
                </div>
                <a
                    href="/api/calendar/google"
                    className="w-full py-4 rounded-xl font-bold bg-[#4285F4] text-white hover:bg-[#3367D6] transition-colors flex items-center justify-center gap-2 block text-center"
                >
                    <svg className="w-5 h-5 bg-white rounded-sm p-0.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /><path d="M1 1h22v22H1z" fill="none" /></svg>
                    Koble til Google
                </a>
            </section>
        </div>
    );
}

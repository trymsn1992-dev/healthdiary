"use client";

import { Home, Calendar, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { LogModal } from "./LogModal";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

export function BottomNav() {
    const pathname = usePathname();
    const [isLogOpen, setIsLogOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    // We need the user ID for the LogModal. 
    // Ideally this comes from a Context, but fetching here for now is acceptable for MVP.
    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user);
        });
    }, []);

    if (!user) return null; // Don't show nav if not logged in (or loading)

    const isActive = (path: string) => pathname === path;

    return (
        <>
            <div className="fixed bottom-0 left-0 right-0 z-30 bg-neutral-950/80 backdrop-blur-md border-t border-neutral-800 pb-safe">
                <div className="flex justify-around items-center h-20 max-w-md mx-auto px-6 relative">

                    {/* Home Link */}
                    <Link
                        href="/"
                        className={cn(
                            "flex flex-col items-center gap-1 transition-colors",
                            isActive("/") ? "text-indigo-400" : "text-neutral-500 hover:text-neutral-300"
                        )}
                    >
                        <Home className="w-6 h-6" />
                        <span className="text-xs font-medium">Oversikt</span>
                    </Link>

                    {/* FAB - Log Button */}
                    <div className="relative -top-6">
                        <button
                            onClick={() => setIsLogOpen(true)}
                            className="w-16 h-16 rounded-full bg-indigo-600 shadow-lg shadow-indigo-900/50 flex items-center justify-center text-white hover:bg-indigo-500 transition-all active:scale-95 ring-4 ring-neutral-950"
                        >
                            <Plus className="w-8 h-8" strokeWidth={2.5} />
                        </button>
                        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-bold text-indigo-400 mt-1">Logg</span>
                    </div>

                    {/* History Link */}
                    <Link
                        href="/history"
                        className={cn(
                            "flex flex-col items-center gap-1 transition-colors",
                            isActive("/history") ? "text-indigo-400" : "text-neutral-500 hover:text-neutral-300"
                        )}
                    >
                        <Calendar className="w-6 h-6" />
                        <span className="text-xs font-medium">Historikk</span>
                    </Link>
                </div>
            </div>

            <LogModal
                isOpen={isLogOpen}
                onClose={() => setIsLogOpen(false)}
                userId={user.id}
            />
        </>
    );
}

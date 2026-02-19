
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RotateCw, Mail, CheckCircle, ArrowRight } from 'lucide-react'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isSent, setIsSent] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const supabase = createClient()

    async function signInWithEmail(e: React.FormEvent) {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                // dynamic redirect to current origin + /auth/callback
                emailRedirectTo: `${location.origin}/auth/callback`,
            },
        })

        if (error) {
            setError(error.message)
        } else {
            setIsSent(true)
        }
        setIsLoading(false)
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-4 font-sans text-zinc-100">
            <div className="w-full max-w-md space-y-8 rounded-2xl bg-zinc-900/50 p-8 shadow-xl ring-1 ring-white/10 backdrop-blur-xl">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-white">Health Diary</h2>
                    <p className="mt-2 text-sm text-zinc-400">Sign in to access your personal journal</p>
                </div>

                {isSent ? (
                    <div className="flex flex-col items-center space-y-4 rounded-lg bg-green-500/10 p-6 text-center animate-in fade-in zoom-in duration-300">
                        <div className="rounded-full bg-green-500/20 p-3">
                            <CheckCircle className="h-8 w-8 text-green-500" />
                        </div>
                        <h3 className="text-lg font-medium text-green-400">Check your email</h3>
                        <p className="text-zinc-400">
                            We've sent a magic link to <span className="font-medium text-white">{email}</span>.
                            <br />
                            Click the link to sign in.
                        </p>
                        <button
                            onClick={() => setIsSent(false)}
                            className="mt-4 text-sm text-zinc-500 hover:text-white transition-colors"
                        >
                            Use a different email
                        </button>
                    </div>
                ) : (
                    <form className="mt-8 space-y-6" onSubmit={signInWithEmail}>
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-medium text-zinc-400">
                                Email address
                            </label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <Mail className="h-5 w-5 text-zinc-500" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full rounded-lg border-0 bg-zinc-800/50 py-3 pl-10 text-white placeholder:text-zinc-600 ring-1 ring-inset ring-zinc-700/50 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 transition-all"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-400 ring-1 ring-inset ring-red-500/20">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex w-full items-center justify-center rounded-lg bg-white px-3 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {isLoading ? (
                                <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    Send Magic Link <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}

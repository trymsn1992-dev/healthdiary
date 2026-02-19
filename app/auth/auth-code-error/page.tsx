
export default function AuthErrorPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
            <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
            <p className="mb-4">Something went wrong during the authentication process.</p>
            <a
                href="/login"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
                Try Again
            </a>
        </div>
    )
}

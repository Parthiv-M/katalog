export default function DesktopGraphsNotice() {
    return (
        <div className="relative h-full w-full overflow-hidden rounded-lg border border-zinc-700/50 bg-zinc-900">
            {/* Hero backdrop (matches the ShareCard's book imagery) */}
            <div className="absolute inset-0 bg-[url(/library.jpg)] bg-cover bg-center grayscale opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/85 to-zinc-900/40" />

            <div className="relative h-full w-full flex flex-col items-center justify-center text-center gap-4 p-8">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="44"
                    height="44"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-neutral-200"
                >
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
                <h2 className="text-2xl font-semibold text-white leading-tight">
                    More on desktop
                </h2>
                <p className="text-neutral-400 text-sm max-w-xs leading-relaxed">
                    A few more graphs, like your activity calendar and trends over time,
                    are available on a larger screen.
                </p>
            </div>
        </div>
    );
}

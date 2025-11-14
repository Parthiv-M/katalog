export default function GraphWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="h-full w-full bg-gradient-to-br from-zinc-800 to-zinc-850 rounded-lg border border-zinc-700/50">
            {children}
        </div>
    )
}
export default function CustomTooltip({
    children,
    width = "w-42"
}: {
    children: React.ReactNode;
    width?: string
}) {
    return (
        <div className={`bg-neutral-700 shadow-lg border border-neutral-700 p-2 rounded text-sm ` + width}>
            {children}
        </div>
    )
}
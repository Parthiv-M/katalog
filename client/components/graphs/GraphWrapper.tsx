export default function GraphWrapper({
    children,
    title,
    classes,
    isAlwaysTitle = true
}: {
    children: React.ReactNode;
    title: string;
    classes?: string;
    isAlwaysTitle?: boolean
}) {
    let titleClasses = "-translate-y-full transition-transform duration-300 ease-in-out group-hover:translate-y-0";
    if (isAlwaysTitle) {
        titleClasses = "";
    }
    return (
        <div className={`group ${isAlwaysTitle && "pt-6"} relative overflow-hidden h-full w-full bg-gradient-to-br from-zinc-800 to-zinc-850 rounded-lg border border-zinc-700/50 hover:border-zinc-600/80 ` + classes}>
            <div className={`absolute px-2 py-1 z-10 rounded-t-lg bg-neutral-900/50 backdrop-blur-md top-0 w-full text-sm text-neutral-200 ` + titleClasses}>
                {title}
            </div>
            {children}
        </div>
    )
}
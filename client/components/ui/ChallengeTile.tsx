import { getChallengeData } from "@/lib/queries/challengeQueries";
import { ReadingChallenge } from "@/types";
import GraphWrapper from "../graphs/GraphWrapper";

export default async function ChallengeCard() {
    const data: ReadingChallenge = await getChallengeData();
    if (!data) {
        return (
            <div className="h-full w-full flex flex-col justify-center items-center text-neutral-500 text-sm p-4">
                <p>No challenge data found.</p>
            </div>
        );
    }

    const goal = data.goal;
    const completed = data.books_completed;
    const percentage = data.percentage;

    const isAhead = (data.books_ahead || 0) > 0;
    const isBehind = (data.books_behind || 0) > 0;
    const isOverGoal = percentage >= 100;

    const booksLeft = Math.max(0, goal - completed);
    const booksOver = Math.max(0, completed - goal);

    const currentMonth = new Date().getMonth(); // 0-11
    const monthsRemaining = 12 - currentMonth;
    const booksNeededPerMonth = monthsRemaining > 0
        ? Math.ceil(booksLeft / monthsRemaining)
        : booksLeft;

    const radius = 110;
    const stroke = 15;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;

    // Cap progress at 100 for the main ring, calculate excess for the second ring
    const mainProgress = Math.min(percentage, 100);
    const mainOffset = circumference - (mainProgress / 100) * circumference;

    const excessProgress = percentage > 100 ? percentage - 100 : 0;
    const excessOffset = circumference - (excessProgress / 100) * circumference;

    let statusText = "On track";
    let statusColor = "text-neutral-400";
    let progressColor = "stroke-indigo-500";
    const messageTitle = `${completed} books read`;
    let messageSubtitle = `${booksLeft} books left`;
    let messageBody = "Keep going, you will achieve your goal soon!";

    if (isBehind) {
        statusText = "Behind schedule";
        statusColor = "text-amber-500"; // Warning color
        progressColor = "stroke-amber-500";
        messageSubtitle = `${booksLeft} books left`;
        messageBody = `Read ${booksNeededPerMonth} books per month for the next ${monthsRemaining} months to finish on time.`;
    } else if (isOverGoal) {
        statusText = "Hurray!";
        statusColor = "text-emerald-400";
        progressColor = "stroke-indigo-500"; // Base complete
        messageSubtitle = `${booksOver} books over goal`;
        messageBody = "Great job reading more than what you planned!";
    } else if (isAhead) {
        statusText = "Ahead of schedule";
        statusColor = "text-emerald-400";
        progressColor = "stroke-emerald-500";
        messageBody = "You are crushing your reading goals this year.";
    }

    return (
        <GraphWrapper title={`Reading challenge ${data.year}`}>
            <div className="p-4 h-full flex items-center justify-between gap-8">
            <div className="relative flex-shrink-0 flex items-center justify-center">
                <svg
                    height={radius * 2 + 10} // Padding
                    width={radius * 2 + 10}
                    className="rotate-[-90deg] overflow-visible"
                >
                    {/* Background Track */}
                    <circle
                        stroke="currentColor"
                        fill="transparent"
                        strokeWidth={stroke}
                        strokeDasharray={circumference + ' ' + circumference}
                        className="text-zinc-800"
                        r={normalizedRadius}
                        cx="50%"
                        cy="50%"
                    />
                    {/* Main Progress Ring */}
                    <circle
                        stroke="currentColor"
                        fill="transparent"
                        strokeWidth={stroke}
                        strokeDasharray={circumference + ' ' + circumference}
                        style={{ strokeDashoffset: mainOffset }}
                        strokeLinecap="round"
                        className={`${progressColor} transition-all duration-1000 ease-out`}
                        r={normalizedRadius}
                        cx="50%"
                        cy="50%"
                    />
                    {/* Excess Ring (Only visible if > 100%) */}
                    {isOverGoal && (
                        <circle
                            stroke="currentColor"
                            fill="transparent"
                            strokeWidth={stroke}
                            strokeDasharray={circumference + ' ' + circumference}
                            style={{ strokeDashoffset: excessOffset }}
                            strokeLinecap="round"
                            className="text-emerald-400 transition-all duration-1000 ease-out"
                            r={normalizedRadius}
                            cx="50%"
                            cy="50%"
                        />
                    )}
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-neutral-200 tracking-tighter">
                        {Math.round(percentage)}%
                    </span>
                    <span className={`text-[12px] font-medium uppercase tracking-wide ${statusColor}`}>
                        {statusText}
                    </span>
                </div>
            </div>
            <div className="flex flex-col justify-center flex-1 min-w-0">
                <h3 className="text-2xl font-bold text-white whitespace-nowrap overflow-hidden text-ellipsis">
                    {messageTitle}
                </h3>
                <h4 className="text-2xl font-medium text-neutral-400 mb-2">
                    {messageSubtitle}
                </h4>
                <p className="w-64 text-md text-neutral-500 leading-relaxed">
                    {messageBody}
                </p>
            </div>
            </div>
        </GraphWrapper>
    )
}
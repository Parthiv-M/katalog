"use client";

import { LibrarySummary } from "@/types";
import "@fontsource/jersey-25";
import { useState } from "react";

const getReaderArchetype = (summary: LibrarySummary, topAuthor: string) => {
    const { totalBooksRead, totalPagesRead, tbrCount } = summary;

    if (totalBooksRead > 50)
        return {
            title: "The Volume Reader",
            text: "I have absolutely zero concept of shelf control.",
        };

    if (totalPagesRead > 15000)
        return {
            title: "The Endurance Reader",
            text: "I don't count books, I prefer to weigh them.",
        };

    if (tbrCount > totalBooksRead * 2)
        return {
            title: "Tsundoku Master",
            text: "My TBR pile is looking structurally unsafe.",
        };

    if (topAuthor && totalBooksRead > 10)
        return {
            title: "The Devotee",
            text: `Simping for ${topAuthor} since day one.`,
        };

    return { title: "The Reader", text: "Just one more chapter..." };
};

const generateShareText = (summary: LibrarySummary, topAuthor: string, percentage: number) => {
    const totalBlocks = 10;
    const filledBlocks = Math.min(Math.round((percentage / 100) * totalBlocks), totalBlocks);
    // Ensure there are no negative empty blocks
    const safeFilled = Math.max(0, filledBlocks);
    const emptyBlocks = Math.max(0, totalBlocks - safeFilled);

    const progressBar = '📕'.repeat(safeFilled) + '📓'.repeat(emptyBlocks);

    return `MY READING STATS
📄 Pages:      ${summary.totalPagesRead.toLocaleString()}
🏆 Top Author: ${topAuthor}
📅 Last Read:  ${summary.lastRead?.title || 'None'}
📖 Current:    ${summary.currentlyReading?.title || 'None'}

MY ${new Date().getFullYear()} READING WRAPPED
${progressBar}
${Math.round(percentage)}% Complete
`;
};

export default function ShareCard({
    summary,
    topAuthor,
    percentage
}: {
    summary: LibrarySummary;
    topAuthor: string;
    percentage: number
}) {
    const [copied, setCopied] = useState(false);
    const { text } = getReaderArchetype(summary, topAuthor);

    const handleShare = async () => {
        const shareText = generateShareText(summary, topAuthor, percentage);
        const shareData = {
            title: 'Reading Stats',
            text: shareText,
        };

        try {
            // Native share for mobile
            if (navigator.share && navigator.canShare(shareData)) {
                await navigator.share(shareData);
            } else {
                // Clipboard share for desktop
                await navigator.clipboard.writeText(shareText);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000); // Reset icon after 2s
            }
        } catch (err) {
            console.error('Error sharing:', err);
        }
    };

    if (!summary) return null;

    return (
        <div
            className="h-full w-full relative group overflow-hidden bg-zinc-900 rounded-lg border border-zinc-700/50"
        >
            <p className="px-6 py-4 text-neutral-400 text-sm">{text}</p>
            <div className='relative w-full h-40 bg-[url(/books.jpg)] bg-cover grayscale'>
                <div className='w-full h-full flex flex-col justify-center bg-gradient-to-r from-zinc-900 via-zinc-900/80 to-transparent px-6 py-4'>
                    <p className='text-neutral-400 text-xs uppercase tracking-wider mb-1'>Overall Reading Stats</p>

                    <div className="share-card-header-text text-white leading-none">
                        <p className='text-5xl'>{summary.totalBooksRead} books</p>
                        <p className='text-4xl text-zinc-500'>{summary.totalPagesRead} pages</p>
                    </div>
                </div>

                {/* Copied Text Indicator */}
                <div
                    className={`absolute top-1/2 -translate-y-1/2 right-20 transition-all duration-300 ease-out pointer-events-none ${copied ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
                        }`}
                >
                    <span className="text-xs font-bold bg-white/80 text-neutral-700 backdrop-blur-md border px-3 py-1.5 rounded-full shadow-lg">
                        Copied!
                    </span>
                </div>

                {/* Share Button */}
                <button
                    className='absolute top-1/2 -translate-y-1/2 right-6 bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-600 hover:border-white text-white rounded-full p-3 transition-all duration-200 backdrop-blur-sm group/btn'
                    onClick={handleShare}
                    title="Share stats"
                >
                    {copied ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    ) : (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="group-hover/btn:scale-110 transition-transform"
                        >
                            <circle cx="18" cy="5" r="3"></circle>
                            <circle cx="6" cy="12" r="3"></circle>
                            <circle cx="18" cy="19" r="3"></circle>
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                        </svg>
                    )}
                </button>
            </div>
            <div className="px-6 pt-6">
                <div className="flex gap-4">
                    <div>
                        <h6 className="text-sm text-neutral-400 uppercase">To-Be-Read</h6>
                        <p className="">{summary.tbrCount} books</p>
                    </div>
                    <div>
                        <h6 className="text-sm text-neutral-400 uppercase">Top Author</h6>
                        <p className="">{topAuthor}</p>
                    </div>
                </div>

                <div className="mt-4">
                    <h6 className="text-sm text-neutral-400 uppercase">Last Read</h6>
                    <p className="">
                        {summary.lastRead?.title}{" "}
                        <span className="text-sm text-neutral-500 italic">
                            by {summary.lastRead?.author}
                        </span>
                    </p>
                </div>

                <div className="mt-4">
                    <h6 className="text-sm text-neutral-400 uppercase">
                        Currently Reading
                    </h6>
                    <p className="">
                        {summary.currentlyReading?.title ?? "Nothing"}
                        {summary.currentlyReading && (
                            <span className="text-sm text-neutral-500 italic">
                                {" "}
                                by {summary.currentlyReading?.author}
                            </span>
                        )}
                    </p>
                </div>
            </div>
            <div className="px-6 mt-5 absolute bottom-5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/katalog.png" height={20} width={80} alt="Katalog Logo" />
            </div>
        </div>
    );
}

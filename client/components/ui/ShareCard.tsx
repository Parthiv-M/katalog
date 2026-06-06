"use client";

import { LibrarySummary } from "@/types";
import "@fontsource/jersey-25";

export default function ShareCard({
    summary,
}: {
    summary: LibrarySummary;
    topAuthor: string;
    percentage: number
}) {
    if (!summary) return null;

    return (
        <div
            className="h-auto lg:h-full w-full relative group overflow-hidden bg-zinc-900 rounded-lg border border-zinc-700/50"
        >
            <div className='relative w-full h-40 bg-[url(/books.jpg)] bg-cover grayscale'>
                <div className='w-full h-full flex flex-col justify-center bg-gradient-to-r from-zinc-900 via-zinc-900/80 to-transparent px-6 py-4'>
                    <p className='text-neutral-400 text-xs uppercase tracking-wider mb-1'>Overall Reading Stats</p>

                    <div className="share-card-header-text text-white leading-none">
                        <p className='text-5xl'>{summary.totalBooksRead} books</p>
                        <p className='text-4xl text-zinc-500'>{summary.totalPagesRead} pages</p>
                    </div>
                </div>
            </div>
            <div className="px-6 pt-6">
                <div className="">
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
            <div className="px-6 mt-5 pb-5 relative lg:absolute lg:bottom-5 lg:pb-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/katalog.png" height={20} width={80} alt="Katalog Logo" />
            </div>
        </div>
    );
}

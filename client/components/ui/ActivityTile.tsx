// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ActivityTile({ data }: { data: any }) {
    if (!data || !data.header_text || !data.book_title) return;
    const saneDate = new Date(data.timestamp);
    return (
        <div className="w-full min-h-12 border-b p-2 text-sm">
            <p className="text-neutral-500">{saneDate.toLocaleString()}</p>
            <p className="text-neutral-400">{data.header_text} {data.book_title}</p>
        </div>
    )
}
export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-zinc-700 border-t-indigo-500"></div>
      </div>
      <p className="text-zinc-400 text-sm animate-pulse">Loading dashboard...</p>
    </div>
  );
}
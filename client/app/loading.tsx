import LoadingSpinner from '@/components/ui/Loader';

export default function Loading() {
  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}
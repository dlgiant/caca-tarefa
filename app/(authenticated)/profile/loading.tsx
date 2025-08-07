import { CardSkeleton } from '@/components/ui/loading-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="space-y-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <div className="space-y-6 md:col-span-2">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
